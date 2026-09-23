using System;
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

public class ReviewService : IReviewService
{
    private readonly DormiDbContext _db;

    public ReviewService(DormiDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<RoomReviewSummaryDto>> GetRoomReviewsAsync(Guid roomId)
    {
        var roomExists = await _db.Rooms.AnyAsync(r => r.Id == roomId);
        if (!roomExists) return ServiceResult<RoomReviewSummaryDto>.NotFound("Không tìm thấy phòng trọ.");

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

        return ServiceResult<RoomReviewSummaryDto>.Ok(new RoomReviewSummaryDto
        {
            AverageRating = averageRating,
            TotalReviews = reviews.Count,
            Reviews = reviews
        });
    }

    public async Task<ServiceResult<object>> AddReviewAsync(Guid roomId, Guid userId, CreateReviewDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return ServiceResult<object>.Fail("Chỉ tài khoản Khách thuê mới có thể viết đánh giá.", 400);
        }

        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return ServiceResult<object>.Fail("Số điểm đánh giá phải từ 1 đến 5 sao.", 400);
        }

        var alreadyReviewed = await _db.RoomReviews.AnyAsync(r => r.RoomId == roomId && r.CustomerId == userId);
        if (alreadyReviewed)
        {
            return ServiceResult<object>.Fail("Bạn đã gửi đánh giá cho phòng trọ này rồi.", 400);
        }

        var hasValidAppointment = await _db.ViewingAppointments.AnyAsync(a =>
            a.RoomId == roomId &&
            a.CustomerId == userId &&
            (a.Status == "Confirmed" || a.Status == "Completed"));

        if (!hasValidAppointment)
        {
            return ServiceResult<object>.Fail("Bạn chỉ có thể đánh giá sau khi đã có lịch hẹn xem phòng được xác nhận hoặc hoàn thành.", 400);
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

        return ServiceResult<object>.Ok(new { id = review.Id, message = "Đã gửi đánh giá thành công!" });
    }
}
