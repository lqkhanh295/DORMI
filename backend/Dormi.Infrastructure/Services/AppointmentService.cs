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
                EventType = "AppointmentCreated",
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
            .Where(a => a.CustomerId == userId || a.Room.LandlordId == userId)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id,
                CustomerId = a.CustomerId,
                CustomerName = a.Customer.FullName,
                RoomId = a.RoomId,
                RoomTitle = a.Room.Title,
                RoomAddress = a.Room.Address,
                AppointmentDate = a.AppointmentDate,
                Status = a.Status,
                Notes = a.Notes,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return ServiceResult<List<AppointmentResponseDto>>.Ok(appointments);
    }

    public async Task<ServiceResult<object>> UpdateStatusAsync(Guid id, Guid userId, bool isAdmin, UpdateAppointmentStatusDto dto)
    {
        var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
        if (string.IsNullOrWhiteSpace(dto.Status) || !validStatuses.Contains(dto.Status))
        {
            return ServiceResult<object>.Fail("Trạng thái lịch hẹn không hợp lệ. Các trạng thái được hỗ trợ: Pending, Confirmed, Cancelled, Completed.", 400);
        }

        var appointment = await _db.ViewingAppointments
            .Include(a => a.Room)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return ServiceResult<object>.NotFound("Không tìm thấy lịch hẹn.");

        if (!isAdmin && appointment.CustomerId != userId && appointment.Room.LandlordId != userId)
        {
            return ServiceResult<object>.Forbidden();
        }

        if (appointment.Status == "Cancelled" || appointment.Status == "Completed")
        {
            return ServiceResult<object>.Fail($"Lịch hẹn đã ở trạng thái kết thúc ({appointment.Status}), không thể thay đổi thêm.", 400);
        }

        if (appointment.Status == "Pending" && dto.Status == "Completed")
        {
            return ServiceResult<object>.Fail("Lịch hẹn cần được xác nhận (Confirmed) trước khi chuyển sang hoàn thành (Completed).", 400);
        }

        if (appointment.CustomerId == userId && appointment.Room.LandlordId != userId)
        {
            if (dto.Status != "Cancelled")
            {
                return ServiceResult<object>.Fail("Khách thuê chỉ có thể hủy lịch hẹn (Cancelled).", 400);
            }
        }

        appointment.Status = dto.Status;
        await _db.SaveChangesAsync();

        if (_kafkaProducer != null)
        {
            var recipientId = (appointment.CustomerId == userId) ? appointment.Room.LandlordId : appointment.CustomerId;
            var roomTitle = appointment.Room?.Title ?? "phòng trọ";

            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = "AppointmentStatusUpdated",
                UserId = recipientId,
                Title = "Cập nhật trạng thái lịch hẹn",
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
}
