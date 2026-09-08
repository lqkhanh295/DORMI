using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
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
        var pendingVerifications = await _db.Users.CountAsync(u => u.Role == UserRole.Landlord && !u.IsVerified);
        var totalAppointments = await _db.ViewingAppointments.CountAsync();

        var stats = new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalCustomers = totalCustomers,
            TotalLandlords = totalLandlords,
            TotalRooms = totalRooms,
            PendingVerifications = pendingVerifications,
            TotalAppointments = totalAppointments,
            TotalRevenue = totalLandlords * 199000m // Simulated platform subscription revenue
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
        var verifications = await _db.Users
            .Where(u => u.Role == UserRole.Landlord && !u.IsVerified)
            .Select(u => new
            {
                LandlordId = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber
            })
            .ToListAsync();

        return Ok(verifications);
    }

    [HttpPatch("verifications/{landlordId}")]
    public async Task<IActionResult> UpdateVerificationStatus(Guid landlordId, [FromBody] VerificationApprovalDto dto)
    {
        var landlord = await _db.Users.FirstOrDefaultAsync(u => u.Id == landlordId && u.Role == UserRole.Landlord);
        if (landlord == null) return NotFound(new { message = "Không tìm thấy thông tin chủ trọ." });

        landlord.IsVerified = dto.Approved;
        await _db.SaveChangesAsync();

        return Ok(new { message = dto.Approved ? "Đã duyệt xác minh chủ trọ thành công." : "Đã từ chối xác minh chủ trọ." });
    }

    [AllowAnonymous]
    [HttpGet("rooms")]
    public async Task<IActionResult> GetRoomsForModeration()
    {
        var rooms = await _db.Rooms
            .Include(r => r.Landlord)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.Address,
                r.Price,
                LandlordName = r.Landlord.FullName,
                r.Status,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(rooms);
    }

    [AllowAnonymous]
    [HttpPatch("rooms/{roomId}/status")]
    public async Task<IActionResult> UpdateRoomStatus(Guid roomId, [FromQuery] RoomStatus status)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        room.Status = status;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã cập nhật trạng thái phòng thành: {status}" });
    }
}
