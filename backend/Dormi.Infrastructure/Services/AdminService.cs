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
using Dormi.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly DormiDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;

    public AdminService(DormiDbContext db, IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<ServiceResult<AdminStatsDto>> GetStatsAsync()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalCustomers = await _db.Users.CountAsync(u => u.Role == UserRole.Customer);
        var totalLandlords = await _db.Users.CountAsync(u => u.Role == UserRole.Landlord);
        var totalRooms = await _db.Rooms.CountAsync();
        var pendingVerifications = await _db.VerificationRequests.CountAsync(r => r.Status == "Pending");
        var totalAppointments = await _db.ViewingAppointments.CountAsync();

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

        return ServiceResult<AdminStatsDto>.Ok(stats);
    }

    public async Task<ServiceResult<List<UserModerationDto>>> GetUsersAsync(UserRole? role)
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

        return ServiceResult<List<UserModerationDto>>.Ok(users);
    }

    public async Task<ServiceResult<object>> GetPendingVerificationsAsync()
    {
        var verifications = await _db.VerificationRequests
            .Include(v => v.User)
            .Where(v => v.Status == "Pending")
            .OrderByDescending(v => v.SubmittedAt)
            .Select(v => new
            {
                Id = v.Id,
                RequestId = v.Id,
                UserId = v.UserId,
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

        return ServiceResult<object>.Ok(verifications);
    }

    public async Task<ServiceResult<object>> UpdateVerificationStatusAsync(Guid id, ReviewVerificationDto dto)
    {
        var request = await _db.VerificationRequests
            .Include(r => r.User)
            .Where(r => (r.Id == id || r.UserId == id) && r.Status == "Pending")
            .OrderByDescending(r => r.SubmittedAt)
            .FirstOrDefaultAsync();

        User? landlord = null;
        if (request != null)
        {
            landlord = request.User ?? await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId && u.Role == UserRole.Landlord);
        }
        else
        {
            landlord = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Landlord);
        }

        if (landlord == null && request == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy thông tin yêu cầu xác minh hoặc chủ trọ.");
        }

        if (landlord != null)
        {
            landlord.IsVerified = dto.Approved;
        }

        if (request != null)
        {
            request.Status = dto.Approved ? "Approved" : "Rejected";
            request.RejectReason = dto.Approved ? null : (dto.RejectReason ?? "Giấy tờ chưa hợp lệ hoặc mờ");
            request.ReviewedAt = DateTime.UtcNow;
        }

        var landlordId = landlord?.Id ?? request!.UserId;

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

        return ServiceResult<object>.Ok(new { message = dto.Approved ? "Đã duyệt xác minh chủ trọ thành công." : "Đã từ chối xác minh chủ trọ." });
    }

    public async Task<ServiceResult<object>> GetRoomsForModerationAsync()
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

        return ServiceResult<object>.Ok(rooms);
    }

    public async Task<ServiceResult<object>> UpdateRoomStatusAsync(Guid roomId, RoomStatus status)
    {
        var room = await _db.Rooms.Include(r => r.Landlord).FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        bool isValidTransition = (room.Status, status) switch
        {
            (RoomStatus.PendingApproval, RoomStatus.Available) => true,
            (RoomStatus.PendingApproval, RoomStatus.Hidden) => true,
            (RoomStatus.Available, RoomStatus.Rented) => true,
            (RoomStatus.Available, RoomStatus.Hidden) => true,
            (RoomStatus.Rented, RoomStatus.Available) => true,
            (RoomStatus.Rented, RoomStatus.Hidden) => true,
            (RoomStatus.Hidden, RoomStatus.Available) => true,
            (RoomStatus.Hidden, RoomStatus.PendingApproval) => true,
            var (from, to) when from == to => true,
            _ => false
        };

        if (!isValidTransition)
        {
            return ServiceResult<object>.Fail($"Không thể chuyển đổi trạng thái phòng từ '{room.Status}' sang '{status}'.", 400);
        }

        var oldStatus = room.Status;
        room.Status = status;

        if (oldStatus != status)
        {
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = room.LandlordId,
                Title = status == RoomStatus.Available 
                    ? "Tin đăng phòng đã được phê duyệt" 
                    : (status == RoomStatus.Hidden ? "Tin đăng phòng bị từ chối / ẩn" : "Cập nhật trạng thái tin đăng"),
                Message = $"Tin đăng '{room.Title}' đã được quản trị viên duyệt thành trạng thái: {status}.",
                Type = "System",
                LinkUrl = $"/rooms/{room.Id}",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();

        // Broadcast real-time room moderation event via SignalR
        try
        {
            var payload = new
            {
                roomId = room.Id.ToString(),
                title = room.Title,
                landlordId = room.LandlordId.ToString(),
                landlordName = room.Landlord?.FullName ?? "Chủ trọ",
                oldStatus = (int)oldStatus,
                newStatus = (int)status,
                statusName = status.ToString(),
                updatedAt = DateTime.UtcNow.ToString("o")
            };

            await _hubContext.Clients.Group(room.LandlordId.ToString().ToLower())
                .SendAsync("RoomStatusUpdated", payload);

            await _hubContext.Clients.Group("admins")
                .SendAsync("RoomModerated", payload);

            await _hubContext.Clients.All
                .SendAsync("RoomStatusChanged", payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SignalR Admin Room Approval Notice]: {ex.Message}");
        }

        return ServiceResult<object>.Ok(new { message = $"Đã cập nhật trạng thái phòng thành: {status}" });
    }

    public async Task<ServiceResult<object>> GetReportsAsync()
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

        return ServiceResult<object>.Ok(reports);
    }

    public async Task<ServiceResult<object>> UpdateReportStatusAsync(Guid reportId, string status)
    {
        var report = await _db.RoomReports.FindAsync(reportId);
        if (report == null) return ServiceResult<object>.NotFound("Không tìm thấy báo cáo.");

        report.Status = status;
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = $"Đã cập nhật trạng thái báo cáo thành: {status}" });
    }

    public async Task<ServiceResult<object>> GetRoommatePostsForModerationAsync()
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

        return ServiceResult<object>.Ok(posts);
    }

    public async Task<ServiceResult<object>> UpdateRoommatePostStatusAsync(Guid id, bool isActive)
    {
        var post = await _db.RoommatePosts.FindAsync(id);
        if (post == null) return ServiceResult<object>.NotFound("Không tìm thấy bài đăng ở ghép.");

        post.IsActive = isActive;
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = isActive ? "Đã hiển thị lại bài đăng." : "Đã ẩn bài đăng vi phạm." });
    }
}
