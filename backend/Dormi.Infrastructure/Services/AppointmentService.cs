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

public class AppointmentService : IAppointmentService
{
    private readonly DormiDbContext _db;

    public AppointmentService(DormiDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<object>> CreateAppointmentAsync(Guid userId, CreateAppointmentDto dto)
    {
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

        return ServiceResult<object>.Ok(new { message = "Cập nhật trạng thái lịch hẹn thành công." });
    }
}
