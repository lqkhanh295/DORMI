using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilesController : ControllerBase
{
    private readonly DormiDbContext _db;

    public ProfilesController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet("customer")]
    public async Task<IActionResult> GetCustomerProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy thông tin người dùng." });

        return Ok(new CustomerProfileDto
        {
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Preferences = user.Preferences,
            Lifestyle = user.Lifestyle,
            IsLookingForRoommate = user.IsLookingForRoommate
        });
    }

    [HttpPut("customer")]
    public async Task<IActionResult> UpdateCustomerProfile([FromBody] CustomerProfileDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy thông tin người dùng." });

        if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName.Trim();
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber.Trim();
        if (dto.Preferences != null) user.Preferences = dto.Preferences;
        if (dto.Lifestyle != null) user.Lifestyle = dto.Lifestyle;
        if (dto.IsLookingForRoommate.HasValue) user.IsLookingForRoommate = dto.IsLookingForRoommate.Value;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật hồ sơ thành công.", fullName = user.FullName });
    }

    [HttpGet("landlord")]
    public async Task<IActionResult> GetLandlordProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return NotFound(new { message = "Không tìm thấy thông tin tài khoản Chủ trọ." });
        }

        return Ok(new LandlordProfileDto
        {
            FullName = user.FullName,
            IsVerified = user.IsVerified,
            PhoneNumber = user.PhoneNumber
        });
    }

    [HttpPut("landlord")]
    public async Task<IActionResult> UpdateLandlordProfile([FromBody] LandlordProfileDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return NotFound(new { message = "Không tìm thấy thông tin tài khoản Chủ trọ." });
        }

        if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName.Trim();
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber.Trim();

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật hồ sơ chủ trọ thành công.", fullName = user.FullName });
    }
}
