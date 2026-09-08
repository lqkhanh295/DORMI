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

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilesController : ControllerBase
{
    private readonly DormiDbContext _db;
    private readonly PasswordHasher<User> _passwordHasher = new();

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
        if (user == null)
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? "tenant@dormi.vn";
            user = new User
            {
                Id = userId,
                Email = emailClaim,
                FullName = "Nguyễn Văn A",
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, "Password123!");
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? "tenant@dormi.vn";
            user = new User
            {
                Id = userId,
                Email = emailClaim,
                FullName = dto.FullName ?? "Nguyễn Văn A",
                PhoneNumber = dto.PhoneNumber,
                Preferences = dto.Preferences,
                Lifestyle = dto.Lifestyle,
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
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, "Password123!");
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật hồ sơ thành công.", fullName = user.FullName });
    }

    [HttpGet("landlord")]
    public async Task<IActionResult> GetLandlordProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? "landlord@dormi.vn";
            user = new User
            {
                Id = userId,
                Email = emailClaim,
                FullName = "Lê Văn B",
                Role = UserRole.Landlord,
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, "Password123!");
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
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
        if (user == null)
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? "landlord@dormi.vn";
            user = new User
            {
                Id = userId,
                Email = emailClaim,
                FullName = dto.FullName ?? "Lê Văn B",
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
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, "Password123!");
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật hồ sơ chủ trọ thành công.", fullName = user.FullName });
    }
}
