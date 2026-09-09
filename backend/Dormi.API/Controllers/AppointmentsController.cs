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
public class AppointmentsController : ControllerBase
{
    private readonly DormiDbContext _db;

    public AppointmentsController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return BadRequest(new { message = "Bạn cần có tài khoản Khách thuê để đặt lịch xem phòng." });
        }

        var room = await _db.Rooms.FindAsync(dto.RoomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        // ponytail: Target room must be available
        if (room.Status != RoomStatus.Available)
        {
            return BadRequest(new { message = "Phòng trọ này hiện không khả dụng để đặt lịch hẹn." });
        }

        // ponytail: Appointment date must be strictly in the future
        if (dto.AppointmentDate <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "Thời gian hẹn xem phòng phải ở trong tương lai." });
        }

        // ponytail: Customer cannot double book active appointments for the same room
        var hasActive = await _db.ViewingAppointments.AnyAsync(a =>
            a.RoomId == dto.RoomId &&
            a.CustomerId == userId &&
            (a.Status == "Pending" || a.Status == "Confirmed"));

        if (hasActive)
        {
            return BadRequest(new { message = "Bạn đã có một lịch hẹn đang chờ hoặc đã xác nhận cho phòng trọ này." });
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

        return Ok(new { id = appointment.Id, message = "Đặt lịch xem phòng thành công!" });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyAppointments()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

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

        return Ok(appointments);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        // ponytail: Whitelist valid appointment statuses
        var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
        if (string.IsNullOrWhiteSpace(dto.Status) || !validStatuses.Contains(dto.Status))
        {
            return BadRequest(new { message = "Trạng thái lịch hẹn không hợp lệ. Các trạng thái được hỗ trợ: Pending, Confirmed, Cancelled, Completed." });
        }

        var appointment = await _db.ViewingAppointments
            .Include(a => a.Room)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return NotFound(new { message = "Không tìm thấy lịch hẹn." });

        bool isAdmin = User.IsInRole("Admin");
        if (!isAdmin && appointment.CustomerId != userId && appointment.Room.LandlordId != userId)
        {
            return Forbid();
        }

        // ponytail: Terminal state check - Cancelled or Completed cannot be modified further
        if (appointment.Status == "Cancelled" || appointment.Status == "Completed")
        {
            return BadRequest(new { message = $"Lịch hẹn đã ở trạng thái kết thúc ({appointment.Status}), không thể thay đổi thêm." });
        }

        // ponytail: State machine transition rules:
        // - Pending -> Confirmed (Landlord) or Cancelled (Customer/Landlord)
        // - Confirmed -> Completed (Landlord) or Cancelled (Customer/Landlord)
        if (appointment.Status == "Pending" && dto.Status == "Completed")
        {
            return BadRequest(new { message = "Lịch hẹn cần được xác nhận (Confirmed) trước khi chuyển sang hoàn thành (Completed)." });
        }

        // ponytail: Customer can only cancel their appointment
        if (appointment.CustomerId == userId && appointment.Room.LandlordId != userId)
        {
            if (dto.Status != "Cancelled")
            {
                return BadRequest(new { message = "Khách thuê chỉ có thể hủy lịch hẹn (Cancelled)." });
            }
        }

        appointment.Status = dto.Status;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái lịch hẹn thành công." });
    }
}
