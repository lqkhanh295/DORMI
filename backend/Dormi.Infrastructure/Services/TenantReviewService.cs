using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Services;

public class TenantReviewService : ITenantReviewService
{
    private readonly DormiDbContext _db;

    public TenantReviewService(DormiDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<LeaseContractDto>>> GetMyLeasesAsync(Guid userId)
    {
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

        return ServiceResult<List<LeaseContractDto>>.Ok(leases);
    }

    public async Task<ServiceResult<object>> RateTenantAsync(Guid landlordId, CreateTenantReviewDto dto)
    {
        var user = await _db.Users.FindAsync(landlordId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<object>.Fail("Chỉ Chủ trọ mới có quyền đánh giá người thuê.", 400);
        }

        var tenant = await _db.Users.FindAsync(dto.TenantId);
        if (tenant == null || tenant.Role != UserRole.Customer)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy hồ sơ người thuê.");
        }

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return ServiceResult<object>.Fail("Điểm đánh giá phải từ 1 đến 5 sao.", 400);
        }

        var lease = await _db.LeaseContracts.FirstOrDefaultAsync(l =>
            l.LandlordId == landlordId &&
            l.TenantId == dto.TenantId &&
            (!dto.LeaseId.HasValue || l.Id == dto.LeaseId.Value));

        if (lease == null)
        {
            return ServiceResult<object>.Fail("Bạn chỉ có thể đánh giá người thuê khi đã có hợp đồng thuê phòng (LeaseContract) với họ.", 400);
        }

        bool alreadyReviewed = await _db.TenantReviews.AnyAsync(r =>
            r.LandlordId == landlordId &&
            r.TenantId == dto.TenantId &&
            (dto.LeaseId.HasValue ? r.LeaseId == dto.LeaseId.Value : true));

        if (alreadyReviewed)
        {
            return ServiceResult<object>.Fail("Bạn đã gửi đánh giá cho hợp đồng này rồi.", 400);
        }

        var review = new TenantReview
        {
            Id = Guid.NewGuid(),
            LeaseId = dto.LeaseId ?? lease.Id,
            LandlordId = landlordId,
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

        return ServiceResult<object>.Ok(new { message = "Gửi đánh giá người thuê thành công.", reviewId = review.Id });
    }

    public async Task<ServiceResult<object>> GetTenantReputationAsync(Guid tenantId)
    {
        var reviews = await _db.TenantReviews
            .Include(r => r.Landlord)
            .Where(r => r.TenantId == tenantId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        if (reviews.Count == 0)
        {
            return ServiceResult<object>.Ok(new
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
            LandlordName = r.IsAnonymous ? "Chủ trọ ẩn danh" : r.Landlord?.FullName ?? "Chủ trọ",
            TenantId = r.TenantId,
            Rating = r.Rating,
            PunctualityScore = r.PunctualityScore,
            CleanlinessScore = r.CleanlinessScore,
            RespectScore = r.RespectScore,
            Comment = r.Comment,
            IsAnonymous = r.IsAnonymous,
            CreatedAt = r.CreatedAt
        }).ToList();

        return ServiceResult<object>.Ok(new
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
