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
using Microsoft.Extensions.Caching.Distributed;

namespace Dormi.Infrastructure.Services;

public class AppointmentService : IAppointmentService
{
    private readonly DormiDbContext _db;
    private readonly IDistributedCache? _cache;
    private readonly IKafkaProducer? _kafkaProducer;

    public AppointmentService(DormiDbContext db, IDistributedCache? cache = null, IKafkaProducer? kafkaProducer = null)
    {
        _db = db;
        _cache = cache;
        _kafkaProducer = kafkaProducer;
    }

    public async Task<ServiceResult<object>> CreateAppointmentAsync(Guid userId, CreateAppointmentDto dto)
    {
        if (_cache != null)
        {
            var lockKey = $"lock:appointment:{dto.RoomId}:{userId}";
            var isLocked = await _cache.GetStringAsync(lockKey);
            if (!string.IsNullOrEmpty(isLocked))
            {
                return ServiceResult<object>.Fail("Yêu cầu đặt lịch hẹn của bạn đang được xử lý, vui lòng không thao tác lặp lại.", 429);
            }

            await _cache.SetStringAsync(lockKey, "1", new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(10)
            });
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return ServiceResult<object>.Fail("Bạn cần có tài khoản Khách thuê để đặt lịch xem phòng.", 400);
        }

        var room = await _db.Rooms.FindAsync(dto.RoomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (room.Status != RoomStatus.Available)
        {
            return ServiceResult<object>.Fail("Phòng trọ này hiện không khả dụng để đặt lịch hẹn.", 400);
        }

        if (dto.AppointmentDate <= DateTime.UtcNow)
        {
            return ServiceResult<object>.Fail("Thời gian hẹn xem phòng phải ở trong tương lai.", 400);
        }

        var hasActive = await _db.ViewingAppointments.AnyAsync(a =>
            a.RoomId == dto.RoomId &&
            a.CustomerId == userId &&
            (a.Status == "Pending" || a.Status == "Confirmed"));

        if (hasActive)
        {
            return ServiceResult<object>.Fail("Bạn đã có một lịch hẹn đang chờ hoặc đã xác nhận cho phòng trọ này.", 400);
        }

        var appointment = new ViewingAppointment
        {
            Id = Guid.NewGuid(),
            CustomerId = userId,
            RoomId = dto.RoomId,
            AppointmentDate = dto.AppointmentDate,
            Status = "Pending",
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.ViewingAppointments.Add(appointment);
        await _db.SaveChangesAsync();

        // Publish event to Kafka for async notification to landlord
        if (_kafkaProducer != null)
        {
            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = "ViewingRequested",
                UserId = room.LandlordId,
                Title = "Lịch hẹn xem phòng mới",
                Message = $"Khách hàng vừa đặt lịch hẹn xem phòng '{room.Title}' vào lúc {appointment.AppointmentDate:dd/MM/yyyy HH:mm}.",
                Type = "Appointment",
                LinkUrl = "/landlord/appointments",
                CreatedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, object?>
                {
                    ["appointmentId"] = appointment.Id.ToString(),
                    ["roomId"] = room.Id.ToString(),
                    ["roomTitle"] = room.Title,
                    ["customerId"] = userId.ToString(),
                    ["appointmentDate"] = appointment.AppointmentDate.ToString("o"),
                    ["status"] = appointment.Status
                }
            });
        }

        return ServiceResult<object>.Ok(new { id = appointment.Id, message = "Đặt lịch xem phòng thành công!" });
    }

    public async Task<ServiceResult<List<AppointmentResponseDto>>> GetMyAppointmentsAsync(Guid userId)
    {
        var appointments = await _db.ViewingAppointments
            .Include(a => a.Customer)
            .Include(a => a.Room)
                .ThenInclude(r => r.Images)
            .Include(a => a.Room)
                .ThenInclude(r => r.Landlord)
            .Where(a => a.CustomerId == userId || a.Room.LandlordId == userId)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id,
                CustomerId = a.CustomerId,
                CustomerName = !string.IsNullOrEmpty(a.Customer.FullName) ? a.Customer.FullName : (!string.IsNullOrEmpty(a.Customer.Email) ? a.Customer.Email : "Khách xem phòng"),
                CustomerPhone = a.Customer.PhoneNumber,
                CustomerAvatar = a.Customer.AvatarUrl,
                RoomId = a.RoomId,
                RoomTitle = a.Room.Title,
                RoomAddress = a.Room.Address,
                RoomPrice = a.Room.Price,
                RoomImageUrl = a.Room.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
                LandlordId = a.Room.LandlordId,
                LandlordName = !string.IsNullOrEmpty(a.Room.Landlord.FullName) ? a.Room.Landlord.FullName : (!string.IsNullOrEmpty(a.Room.Landlord.Email) ? a.Room.Landlord.Email : "Chủ trọ"),
                AppointmentDate = a.AppointmentDate,
                Status = a.Status,
                Notes = a.Notes,
                RescheduledDate = a.RescheduledDate,
                RejectionReason = a.RejectionReason,
                CreatedAt = a.CreatedAt,
                CompletedAt = a.CompletedAt
            })
            .ToListAsync();

        return ServiceResult<List<AppointmentResponseDto>>.Ok(appointments);
    }

    public async Task<ServiceResult<object>> UpdateStatusAsync(Guid id, Guid userId, bool isAdmin, UpdateAppointmentStatusDto dto)
    {
        var validStatuses = new[] { "Requested", "Pending", "Confirmed", "Rescheduled", "Completed", "Cancelled", "Rejected", "NoShow" };
        if (string.IsNullOrWhiteSpace(dto.Status) || !validStatuses.Contains(dto.Status))
        {
            return ServiceResult<object>.Fail("Trạng thái lịch hẹn không hợp lệ. Các trạng thái được hỗ trợ: Requested, Confirmed, Rescheduled, Completed, Cancelled, Rejected, NoShow.", 400);
        }

        var appointment = await _db.ViewingAppointments
            .Include(a => a.Room)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return ServiceResult<object>.NotFound("Không tìm thấy lịch hẹn.");

        if (!isAdmin && appointment.CustomerId != userId && appointment.Room.LandlordId != userId)
        {
            return ServiceResult<object>.Forbidden();
        }

        if (appointment.Status == "Cancelled" || appointment.Status == "Completed" || appointment.Status == "Rejected" || appointment.Status == "NoShow")
        {
            return ServiceResult<object>.Fail($"Lịch hẹn đã ở trạng thái kết thúc ({appointment.Status}), không thể thay đổi thêm.", 400);
        }

        if (appointment.CustomerId == userId && appointment.Room.LandlordId != userId)
        {
            if (dto.Status != "Cancelled")
            {
                return ServiceResult<object>.Fail("Khách thuê chỉ có quyền hủy lịch hẹn (Cancelled).", 400);
            }
        }

        if (dto.Status == "Completed")
        {
            appointment.CompletedAt = DateTime.UtcNow;
        }
        else if (dto.Status == "Rejected" && !string.IsNullOrWhiteSpace(dto.Reason))
        {
            appointment.RejectionReason = dto.Reason;
        }

        appointment.Status = dto.Status;
        await _db.SaveChangesAsync();

        if (_kafkaProducer != null)
        {
            var recipientId = (appointment.CustomerId == userId) ? appointment.Room.LandlordId : appointment.CustomerId;
            var roomTitle = appointment.Room?.Title ?? "phòng trọ";

            var eventType = (dto.Status == "Confirmed" || dto.Status == "Approved") ? "ViewingConfirmed" : "AppointmentStatusUpdated";

            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = eventType,
                UserId = recipientId,
                Title = "Cập nhật trạng thái lịch hẹn xem phòng",
                Message = $"Lịch hẹn xem '{roomTitle}' đã được cập nhật thành: {dto.Status}.",
                Type = "Appointment",
                LinkUrl = "/appointments",
                CreatedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, object?>
                {
                    ["appointmentId"] = appointment.Id.ToString(),
                    ["roomId"] = appointment.RoomId.ToString(),
                    ["roomTitle"] = roomTitle,
                    ["status"] = dto.Status
                }
            });
        }

        return ServiceResult<object>.Ok(new { message = "Cập nhật trạng thái lịch hẹn thành công." });
    }

    public async Task<ServiceResult<object>> RescheduleAsync(Guid id, Guid userId, RescheduleAppointmentDto dto)
    {
        if (dto.NewAppointmentDate <= DateTime.UtcNow)
        {
            return ServiceResult<object>.Fail("Thời gian hẹn mới phải ở tương lai.", 400);
        }

        var appointment = await _db.ViewingAppointments
            .Include(a => a.Room)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return ServiceResult<object>.NotFound("Không tìm thấy lịch hẹn.");

        if (appointment.CustomerId != userId && appointment.Room.LandlordId != userId)
        {
            return ServiceResult<object>.Forbidden();
        }

        if (appointment.Status == "Cancelled" || appointment.Status == "Completed" || appointment.Status == "Rejected")
        {
            return ServiceResult<object>.Fail($"Lịch hẹn đã kết thúc ({appointment.Status}), không thể đổi lịch.", 400);
        }

        appointment.Status = "Rescheduled";
        appointment.RescheduledDate = dto.NewAppointmentDate;
        appointment.AppointmentDate = dto.NewAppointmentDate;
        if (!string.IsNullOrWhiteSpace(dto.Reason))
        {
            appointment.Notes = string.IsNullOrWhiteSpace(appointment.Notes) 
                ? $"Đổi lịch: {dto.Reason}" 
                : $"{appointment.Notes} | Đổi lịch: {dto.Reason}";
        }

        await _db.SaveChangesAsync();

        if (_kafkaProducer != null)
        {
            var recipientId = (appointment.CustomerId == userId) ? appointment.Room.LandlordId : appointment.CustomerId;
            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = "AppointmentRescheduled",
                UserId = recipientId,
                Title = "Lịch hẹn xem phòng đã được đổi giờ",
                Message = $"Lịch hẹn xem '{appointment.Room.Title}' đã được dời sang {dto.NewAppointmentDate:dd/MM/yyyy HH:mm}.",
                Type = "Appointment",
                LinkUrl = "/appointments",
                CreatedAt = DateTime.UtcNow
            });
        }

        return ServiceResult<object>.Ok(new { message = "Đổi lịch xem phòng thành công!" });
    }
}
