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
public class ProfilesController : ControllerBase
{
    private readonly DormiDbContext _db;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public ProfilesController(DormiDbContext db)
    {
        _db = db;
    }

    private async Task<User?> ResolveCustomerUserAsync()
    {
        // 1. Try JWT User ID claim
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            var user = await _db.Users.FindAsync(userId);
            if (user != null) return user;
        }

        // 2. Try email from X-User-Email header or Email claim
        var email = Request.Headers["X-User-Email"].FirstOrDefault()
                    ?? User.FindFirst(ClaimTypes.Email)?.Value;

        if (!string.IsNullOrWhiteSpace(email))
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());
            if (user != null) return user;
        }

        // 3. Fallback to default tenant
        return await _db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Customer);
    }

    [HttpGet("customer")]
    public async Task<IActionResult> GetCustomerProfile()
    {
        var user = await ResolveCustomerUserAsync();
        if (user == null)
        {
            return Ok(new CustomerProfileDto
            {
                FullName = "Nguyễn Văn A",
                PhoneNumber = "0901234567",
                Preferences = "Phòng yên tĩnh",
                Lifestyle = "Yên tĩnh, Sạch sẽ",
                IsLookingForRoommate = false
            });
        }

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
        var user = await ResolveCustomerUserAsync();
        if (user == null)
        {
            // If user doesn't exist yet, create a new record
            var email = Request.Headers["X-User-Email"].FirstOrDefault()
                        ?? User.FindFirst(ClaimTypes.Email)?.Value 
                        ?? "tenant@dormi.vn";

            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email.Trim().ToLower(),
                FullName = dto.FullName ?? "Người thuê trọ",
                PhoneNumber = dto.PhoneNumber,
                Preferences = dto.Preferences,
                Lifestyle = dto.Lifestyle,
                IsLookingForRoommate = dto.IsLookingForRoommate ?? false,
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, "Password123!");
            _db.Users.Add(user);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName;
            if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
            if (dto.Preferences != null) user.Preferences = dto.Preferences;
            if (dto.Lifestyle != null) user.Lifestyle = dto.Lifestyle;
            if (dto.IsLookingForRoommate.HasValue) user.IsLookingForRoommate = dto.IsLookingForRoommate.Value;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật hồ sơ thành công.", fullName = user.FullName });
    }

    private async Task<User?> ResolveLandlordUserAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            var user = await _db.Users.FindAsync(userId);
            if (user != null) return user;
        }

        var email = Request.Headers["X-User-Email"].FirstOrDefault()
                    ?? User.FindFirst(ClaimTypes.Email)?.Value;

        if (!string.IsNullOrWhiteSpace(email))
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());
            if (user != null) return user;
        }

        return await _db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Landlord);
    }

    [HttpGet("landlord")]
    public async Task<IActionResult> GetLandlordProfile()
    {
        var user = await ResolveLandlordUserAsync();
        if (user == null)
        {
            return Ok(new LandlordProfileDto
            {
                FullName = "Chủ trọ Dormi",
                IsVerified = true,
                PhoneNumber = "0901111001"
            });
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
        var user = await ResolveLandlordUserAsync();
        if (user == null)
        {
            var email = Request.Headers["X-User-Email"].FirstOrDefault()
                        ?? User.FindFirst(ClaimTypes.Email)?.Value 
                        ?? "landlord@dormi.vn";

            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email.Trim().ToLower(),
                FullName = dto.FullName ?? "Chủ trọ Dormi",
                PhoneNumber = dto.PhoneNumber,
                Role = UserRole.Landlord,
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, "Password123!");
            _db.Users.Add(user);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName;
            if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật hồ sơ chủ trọ thành công.", fullName = user.FullName });
    }
}
