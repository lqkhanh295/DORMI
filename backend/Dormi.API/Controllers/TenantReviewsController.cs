using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantReviewsController : ControllerBase
{
    private readonly DormiDbContext _db;

    public TenantReviewsController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet("leases")]
    public async Task<IActionResult> GetMyLeases()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var leases = await _db.LeaseContracts
            .Include(l => l.Room)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Where(l => l.LandlordId == userId || l.TenantId == userId)
            .OrderByDescending(l => l.StartDate)
            .Select(l => new LeaseContractDto
            {
                Id = l.Id,
                RoomId = l.RoomId,
                RoomTitle = l.Room.Title,
                LandlordId = l.LandlordId,
                LandlordName = l.Landlord.FullName,
                TenantId = l.TenantId,
                TenantName = l.Tenant.FullName,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                MonthlyRent = l.MonthlyRent,
                Status = l.Status
            })
            .ToListAsync();

        return Ok(leases);
    }

    [HttpPost]
    public async Task<IActionResult> RateTenant([FromBody] CreateTenantReviewDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return BadRequest(new { message = "Chỉ Chủ trọ mới có quyền đánh giá người thuê." });
        }

        var tenant = await _db.Users.FindAsync(dto.TenantId);
        if (tenant == null || tenant.Role != UserRole.Customer)
        {
            return NotFound(new { message = "Không tìm thấy hồ sơ người thuê." });
        }

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(new { message = "Điểm đánh giá phải từ 1 đến 5 sao." });
        }

        var review = new TenantReview
        {
            Id = Guid.NewGuid(),
            LeaseId = dto.LeaseId,
            LandlordId = userId,
            TenantId = dto.TenantId,
            Rating = dto.Rating,
            PunctualityScore = Math.Clamp(dto.PunctualityScore, 1, 5),
            CleanlinessScore = Math.Clamp(dto.CleanlinessScore, 1, 5),
            RespectScore = Math.Clamp(dto.RespectScore, 1, 5),
            Comment = dto.Comment?.Trim() ?? string.Empty,
            IsAnonymous = dto.IsAnonymous,
            CreatedAt = DateTime.UtcNow
        };

        _db.TenantReviews.Add(review);

        // Notify tenant about new reputation review
        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = dto.TenantId,
            Title = "Bạn nhận được đánh giá tín nhiệm mới",
            Message = $"Chủ trọ đã để lại đánh giá {dto.Rating} sao về lịch sử thuê phòng của bạn.",
            Type = "System",
            LinkUrl = "/tenant/profile",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return Ok(new { message = "Gửi đánh giá người thuê thành công.", reviewId = review.Id });
    }

    [HttpGet("tenant/{tenantId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTenantReputation(Guid tenantId)
    {
        var reviews = await _db.TenantReviews
            .Include(r => r.Landlord)
            .Where(r => r.TenantId == tenantId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        if (reviews.Count == 0)
        {
            return Ok(new
            {
                tenantId = tenantId,
                totalReviews = 0,
                averageRating = 5.0,
                punctualityScore = 5.0,
                cleanlinessScore = 5.0,
                respectScore = 5.0,
                reviews = Array.Empty<TenantReviewDto>()
            });
        }

        var avgRating = Math.Round(reviews.Average(r => r.Rating), 1);
        var avgPunctuality = Math.Round(reviews.Average(r => r.PunctualityScore), 1);
        var avgCleanliness = Math.Round(reviews.Average(r => r.CleanlinessScore), 1);
        var avgRespect = Math.Round(reviews.Average(r => r.RespectScore), 1);

        var list = reviews.Select(r => new TenantReviewDto
        {
            Id = r.Id,
            LandlordId = r.LandlordId,
            LandlordName = r.IsAnonymous ? "Chủ trọ ẩn danh" : r.Landlord.FullName,
            TenantId = r.TenantId,
            Rating = r.Rating,
            PunctualityScore = r.PunctualityScore,
            CleanlinessScore = r.CleanlinessScore,
            RespectScore = r.RespectScore,
            Comment = r.Comment,
            IsAnonymous = r.IsAnonymous,
            CreatedAt = r.CreatedAt
        }).ToList();

        return Ok(new
        {
            tenantId = tenantId,
            totalReviews = reviews.Count,
            averageRating = avgRating,
            punctualityScore = avgPunctuality,
            cleanlinessScore = avgCleanliness,
            respectScore = avgRespect,
            reviews = list
        });
    }
}
