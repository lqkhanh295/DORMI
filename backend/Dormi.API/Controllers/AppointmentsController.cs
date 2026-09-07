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

        var appointment = await _db.ViewingAppointments
            .Include(a => a.Room)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return NotFound(new { message = "Không tìm thấy lịch hẹn." });

        if (appointment.CustomerId != userId && appointment.Room.LandlordId != userId)
        {
            return Forbid();
        }

        appointment.Status = dto.Status;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái lịch hẹn thành công." });
    }
}
