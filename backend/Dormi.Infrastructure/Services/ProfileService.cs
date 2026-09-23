using System;
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

public class ProfileService : IProfileService
{
    private readonly DormiDbContext _db;

    public ProfileService(DormiDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<CustomerProfileDto>> GetCustomerProfileAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return ServiceResult<CustomerProfileDto>.NotFound("Không tìm thấy thông tin người dùng.");

        return ServiceResult<CustomerProfileDto>.Ok(new CustomerProfileDto
        {
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Preferences = user.Preferences,
            Lifestyle = user.Lifestyle,
            IsLookingForRoommate = user.IsLookingForRoommate
        });
    }

    public async Task<ServiceResult<object>> UpdateCustomerProfileAsync(Guid userId, CustomerProfileDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return ServiceResult<object>.NotFound("Không tìm thấy thông tin người dùng.");

        if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName.Trim();
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber.Trim();
        if (dto.Preferences != null) user.Preferences = dto.Preferences;
        if (dto.Lifestyle != null) user.Lifestyle = dto.Lifestyle;
        if (dto.IsLookingForRoommate.HasValue) user.IsLookingForRoommate = dto.IsLookingForRoommate.Value;

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Cập nhật hồ sơ thành công.", fullName = user.FullName });
    }

    public async Task<ServiceResult<LandlordProfileDto>> GetLandlordProfileAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<LandlordProfileDto>.NotFound("Không tìm thấy thông tin tài khoản Chủ trọ.");
        }

        return ServiceResult<LandlordProfileDto>.Ok(new LandlordProfileDto
        {
            FullName = user.FullName,
            IsVerified = user.IsVerified,
            PhoneNumber = user.PhoneNumber
        });
    }

    public async Task<ServiceResult<object>> UpdateLandlordProfileAsync(Guid userId, LandlordProfileDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy thông tin tài khoản Chủ trọ.");
        }

        if (!string.IsNullOrWhiteSpace(dto.FullName)) user.FullName = dto.FullName.Trim();
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber.Trim();

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Cập nhật hồ sơ chủ trọ thành công.", fullName = user.FullName });
    }

    public async Task<ServiceResult<object>> SubmitLandlordVerificationAsync(Guid userId, SubmitVerificationDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<object>.Fail("Chỉ tài khoản Chủ trọ mới có thể gửi yêu cầu xác minh danh tính.", 400);
        }

        if (string.IsNullOrWhiteSpace(dto.DocumentNumber) || string.IsNullOrWhiteSpace(dto.FrontImageUrl) || string.IsNullOrWhiteSpace(dto.BackImageUrl))
        {
            return ServiceResult<object>.Fail("Vui lòng cung cấp đầy đủ Số CCCD/ĐKKD và hình ảnh 2 mặt của giấy tờ xác minh.", 400);
        }

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

            return ServiceResult<object>.Ok(new { message = "Đã cập nhật hồ sơ xác minh đang chờ duyệt.", requestId = existingRequest.Id, status = "Pending" });
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

        return ServiceResult<object>.Ok(new { message = "Hồ sơ xác minh đã được gửi thành công. Ban quản trị sẽ đối soát và phê duyệt trong vòng 24 giờ.", requestId = newRequest.Id, status = "Pending" });
    }

    public async Task<ServiceResult<object>> GetLandlordVerificationAsync(Guid userId)
    {
        var request = await _db.VerificationRequests
            .OrderByDescending(r => r.SubmittedAt)
            .FirstOrDefaultAsync(r => r.UserId == userId);

        var user = await _db.Users.FindAsync(userId);

        return ServiceResult<object>.Ok(new
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
