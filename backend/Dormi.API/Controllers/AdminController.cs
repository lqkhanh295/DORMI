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
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly DormiDbContext _db;

    public AdminController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalCustomers = await _db.Users.CountAsync(u => u.Role == UserRole.Customer);
        var totalLandlords = await _db.Users.CountAsync(u => u.Role == UserRole.Landlord);
        var totalRooms = await _db.Rooms.CountAsync();
        var pendingVerifications = await _db.VerificationRequests.CountAsync(r => r.Status == "Pending");
        var totalAppointments = await _db.ViewingAppointments.CountAsync();

        // ponytail: Real platform revenue aggregated from completed PaymentTransactions
        var realRevenue = await _db.PaymentTransactions
            .Where(t => t.Status == "Completed")
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        var stats = new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalCustomers = totalCustomers,
            TotalLandlords = totalLandlords,
            TotalRooms = totalRooms,
            PendingVerifications = pendingVerifications,
            TotalAppointments = totalAppointments,
            TotalRevenue = realRevenue
        };

        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] UserRole? role)
    {
        var query = _db.Users.AsQueryable();

        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserModerationDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                IsVerifiedLandlord = u.IsVerified,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("verifications")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var verifications = await _db.VerificationRequests
            .Include(v => v.User)
            .Where(v => v.Status == "Pending")
            .OrderByDescending(v => v.SubmittedAt)
            .Select(v => new
            {
                RequestId = v.Id,
                LandlordId = v.UserId,
                FullName = v.User.FullName,
                Email = v.User.Email,
                PhoneNumber = v.User.PhoneNumber,
                DocumentType = v.DocumentType,
                DocumentNumber = v.DocumentNumber,
                FrontImageUrl = v.FrontImageUrl,
                BackImageUrl = v.BackImageUrl,
                Status = v.Status,
                SubmittedAt = v.SubmittedAt
            })
            .ToListAsync();

        return Ok(verifications);
    }

    [HttpPatch("verifications/{landlordId}")]
    public async Task<IActionResult> UpdateVerificationStatus(Guid landlordId, [FromBody] ReviewVerificationDto dto)
    {
        var landlord = await _db.Users.FirstOrDefaultAsync(u => u.Id == landlordId && u.Role == UserRole.Landlord);
        if (landlord == null) return NotFound(new { message = "Không tìm thấy thông tin chủ trọ." });

        var request = await _db.VerificationRequests
            .Where(r => r.UserId == landlordId && r.Status == "Pending")
            .OrderByDescending(r => r.SubmittedAt)
            .FirstOrDefaultAsync();

        landlord.IsVerified = dto.Approved;

        if (request != null)
        {
            request.Status = dto.Approved ? "Approved" : "Rejected";
            request.RejectReason = dto.Approved ? null : (dto.RejectReason ?? "Giấy tờ chưa hợp lệ hoặc mờ");
            request.ReviewedAt = DateTime.UtcNow;
        }

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = landlordId,
            Title = dto.Approved ? "Xác minh danh tính thành công" : "Yêu cầu xác minh bị từ chối",
            Message = dto.Approved
                ? "Hồ sơ xác minh CCCD của bạn đã được phê duyệt. Bạn đã nhận huy hiệu Chủ trọ xác thực và có thể đăng tin phòng."
                : $"Hồ sơ xác minh bị từ chối với lý do: {dto.RejectReason ?? "Thông tin không khớp hoặc ảnh không rõ"}. Vui lòng cập nhật lại.",
            Type = "Verification",
            LinkUrl = "/landlord/verify",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return Ok(new { message = dto.Approved ? "Đã duyệt xác minh chủ trọ thành công." : "Đã từ chối xác minh chủ trọ." });
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> GetRoomsForModeration()
    {
        var rooms = await _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.Description,
                r.Address,
                r.Price,
                r.Area,
                r.RoomType,
                r.Utilities,
                r.Virtual3DUrl,
                LandlordName = r.Landlord.FullName,
                LandlordPhone = r.Landlord.PhoneNumber,
                LandlordEmail = r.Landlord.Email,
                LandlordAvatarUrl = r.Landlord.AvatarUrl,
                IsVerifiedLandlord = r.Landlord.IsVerified,
                r.Status,
                r.CreatedAt,
                Images = r.Images.Select(img => new { img.Id, img.ImageUrl, img.IsPrimary }).ToList()
            })
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpPatch("rooms/{roomId}/status")]
    public async Task<IActionResult> UpdateRoomStatus(Guid roomId, [FromQuery] RoomStatus status)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        room.Status = status;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã cập nhật trạng thái phòng thành: {status}" });
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var reports = await _db.RoomReports
            .Include(r => r.Room)
            .Include(r => r.Reporter)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.RoomId,
                RoomTitle = r.Room.Title,
                r.ReporterId,
                ReporterName = r.Reporter.FullName,
                ReporterEmail = r.Reporter.Email,
                r.Reason,
                r.Details,
                r.Status,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(reports);
    }

    [HttpPatch("reports/{reportId}/status")]
    public async Task<IActionResult> UpdateReportStatus(Guid reportId, [FromQuery] string status)
    {
        var report = await _db.RoomReports.FindAsync(reportId);
        if (report == null) return NotFound(new { message = "Không tìm thấy báo cáo." });

        report.Status = status;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã cập nhật trạng thái báo cáo thành: {status}" });
    }

    [HttpGet("roommate-posts")]
    public async Task<IActionResult> GetRoommatePostsForModeration()
    {
        var posts = await _db.RoommatePosts
            .Include(r => r.Customer)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.Description,
                r.Budget,
                r.Location,
                r.MoveInDate,
                r.GenderPreference,
                r.LifestyleTraits,
                r.IsActive,
                r.CreatedAt,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                CustomerEmail = r.Customer.Email
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpPatch("roommate-posts/{id}/status")]
    public async Task<IActionResult> UpdateRoommatePostStatus(Guid id, [FromQuery] bool isActive)
    {
        var post = await _db.RoommatePosts.FindAsync(id);
        if (post == null) return NotFound(new { message = "Không tìm thấy bài đăng ở ghép." });

        post.IsActive = isActive;
        await _db.SaveChangesAsync();

        return Ok(new { message = isActive ? "Đã hiển thị lại bài đăng." : "Đã ẩn bài đăng vi phạm." });
    }
}
