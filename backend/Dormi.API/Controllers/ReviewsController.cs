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
[Route("api/rooms/{roomId}/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly DormiDbContext _db;

    public ReviewsController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoomReviews(Guid roomId)
    {
        var roomExists = await _db.Rooms.AnyAsync(r => r.Id == roomId);
        if (!roomExists) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        var reviews = await _db.RoomReviews
            .Include(r => r.Customer)
            .Where(r => r.RoomId == roomId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                CustomerAvatar = r.Customer.AvatarUrl,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        double averageRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0.0;

        return Ok(new RoomReviewSummaryDto
        {
            AverageRating = averageRating,
            TotalReviews = reviews.Count,
            Reviews = reviews
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddReview(Guid roomId, [FromBody] CreateReviewDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return BadRequest(new { message = "Chỉ tài khoản Khách thuê mới có thể viết đánh giá." });
        }

        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(new { message = "Số điểm đánh giá phải từ 1 đến 5 sao." });
        }

        var review = new RoomReview
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            CustomerId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.RoomReviews.Add(review);
        await _db.SaveChangesAsync();

        return Ok(new { id = review.Id, message = "Đã gửi đánh giá thành công!" });
    }
}
