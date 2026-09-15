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

    [HttpPost("landlord/verification")]
    public async Task<IActionResult> SubmitLandlordVerification([FromBody] SubmitVerificationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return BadRequest(new { message = "Chỉ tài khoản Chủ trọ mới có thể gửi yêu cầu xác minh danh tính." });
        }

        if (string.IsNullOrWhiteSpace(dto.DocumentNumber) || string.IsNullOrWhiteSpace(dto.FrontImageUrl) || string.IsNullOrWhiteSpace(dto.BackImageUrl))
        {
            return BadRequest(new { message = "Vui lòng cung cấp đầy đủ Số CCCD/ĐKKD và hình ảnh 2 mặt của giấy tờ xác minh." });
        }

        // Check if existing pending request
        var existingRequest = await _db.VerificationRequests
            .OrderByDescending(r => r.SubmittedAt)
            .FirstOrDefaultAsync(r => r.UserId == userId);

        if (existingRequest != null && existingRequest.Status == "Pending")
        {
            existingRequest.DocumentType = dto.DocumentType;
            existingRequest.DocumentNumber = dto.DocumentNumber.Trim();
            existingRequest.FrontImageUrl = dto.FrontImageUrl.Trim();
            existingRequest.BackImageUrl = dto.BackImageUrl.Trim();
            existingRequest.SubmittedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đã cập nhật hồ sơ xác minh đang chờ duyệt.", requestId = existingRequest.Id, status = "Pending" });
        }

        var newRequest = new VerificationRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DocumentType = dto.DocumentType,
            DocumentNumber = dto.DocumentNumber.Trim(),
            FrontImageUrl = dto.FrontImageUrl.Trim(),
            BackImageUrl = dto.BackImageUrl.Trim(),
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };

        _db.VerificationRequests.Add(newRequest);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Hồ sơ xác minh đã được gửi thành công. Ban quản trị sẽ đối soát và phê duyệt trong vòng 24 giờ.", requestId = newRequest.Id, status = "Pending" });
    }

    [HttpGet("landlord/verification")]
    public async Task<IActionResult> GetLandlordVerification()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var request = await _db.VerificationRequests
            .OrderByDescending(r => r.SubmittedAt)
            .FirstOrDefaultAsync(r => r.UserId == userId);

        var user = await _db.Users.FindAsync(userId);

        return Ok(new
        {
            isVerified = user?.IsVerified ?? false,
            hasSubmitted = request != null,
            status = request?.Status ?? (user?.IsVerified == true ? "Approved" : "NotSubmitted"),
            documentType = request?.DocumentType,
            documentNumber = request?.DocumentNumber,
            frontImageUrl = request?.FrontImageUrl,
            backImageUrl = request?.BackImageUrl,
            submittedAt = request?.SubmittedAt,
            reviewedAt = request?.ReviewedAt,
            rejectReason = request?.RejectReason
        });
    }
}
