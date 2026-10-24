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
using Microsoft.Extensions.Caching.Memory;

namespace Dormi.Infrastructure.Services;

// ponytail: Lean service for Rental Application transaction spine.
public class RentalApplicationService : IRentalApplicationService
{
    private readonly DormiDbContext _db;
    private readonly IKafkaProducer? _kafkaProducer;
    private readonly IMemoryCache? _memCache;

    public RentalApplicationService(DormiDbContext db, IKafkaProducer? kafkaProducer = null, IMemoryCache? memCache = null)
    {
        _db = db;
        _kafkaProducer = kafkaProducer;
        _memCache = memCache;
    }

    public async Task<ServiceResult<RentalApplicationResponseDto>> CreateApplicationAsync(Guid tenantId, CreateApplicationDto dto)
    {
        var tenant = await _db.Users.FindAsync(tenantId);
        if (tenant == null || tenant.Role != UserRole.Customer)
        {
            return ServiceResult<RentalApplicationResponseDto>.Fail("Chỉ tài khoản Khách thuê mới có thể nộp hồ sơ thuê phòng.", 400);
        }

        var room = await _db.Rooms.Include(r => r.Landlord).FirstOrDefaultAsync(r => r.Id == dto.RoomId);
        if (room == null)
        {
            return ServiceResult<RentalApplicationResponseDto>.NotFound("Không tìm thấy phòng trọ.");
        }

        if (room.Status != RoomStatus.Available)
        {
            return ServiceResult<RentalApplicationResponseDto>.Fail("Phòng trọ này hiện không còn khả dụng để nộp hồ sơ thuê.", 400);
        }

        if (room.LandlordId == tenantId)
        {
            return ServiceResult<RentalApplicationResponseDto>.Fail("Bạn không thể nộp hồ sơ thuê phòng của chính mình.", 400);
        }

        // ponytail: Check duplicate open application for the exact same room
        var hasActiveForSameRoom = await _db.RentalApplications.AnyAsync(a =>
            a.RoomId == dto.RoomId &&
            a.TenantId == tenantId &&
            (a.Status == ApplicationStatus.Submitted || a.Status == ApplicationStatus.UnderReview || a.Status == ApplicationStatus.MoreInfoRequested));

        if (hasActiveForSameRoom)
        {
            return ServiceResult<RentalApplicationResponseDto>.Fail("Bạn đã có hồ sơ đang được xem xét cho phòng trọ này.", 400);
        }

        var application = new RentalApplication
        {
            Id = Guid.NewGuid(),
            RoomId = dto.RoomId,
            TenantId = tenantId,
            Status = ApplicationStatus.Submitted,
            MonthlyIncome = dto.MonthlyIncome,
            Occupation = dto.Occupation,
            EmployerName = dto.EmployerName,
            OccupantsCount = dto.OccupantsCount,
            DesiredMoveInDate = dto.DesiredMoveInDate,
            LeaseDurationMonths = dto.LeaseDurationMonths,
            NoteToLandlord = dto.NoteToLandlord,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.Documents != null && dto.Documents.Count > 0)
        {
            foreach (var docDto in dto.Documents)
            {
                application.Documents.Add(new ApplicationDocument
                {
                    Id = Guid.NewGuid(),
                    RentalApplicationId = application.Id,
                    DocumentType = docDto.DocumentType,
                    FileUrl = docDto.FileUrl,
                    UploadedAt = DateTime.UtcNow
                });
            }
        }

        _db.RentalApplications.Add(application);
        await _db.SaveChangesAsync();
        InvalidateApplicationCache(room.LandlordId, tenantId);

        if (_kafkaProducer != null)
        {
            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = "ApplicationSubmitted",
                UserId = room.LandlordId,
                Title = "Hồ sơ thuê phòng mới",
                Message = $"{tenant.FullName} vừa nộp hồ sơ thuê phòng '{room.Title}'. Vui lòng kiểm tra và phản hồi.",
                Type = "Application",
                LinkUrl = "/landlord/applications",
                CreatedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, object?>
                {
                    ["applicationId"] = application.Id.ToString(),
                    ["roomId"] = room.Id.ToString(),
                    ["tenantId"] = tenantId.ToString()
                }
            });
        }

        var responseDto = MapToResponseDto(application, room, tenant);
        return ServiceResult<RentalApplicationResponseDto>.Ok(responseDto);
    }

    public async Task<ServiceResult<List<RentalApplicationResponseDto>>> GetTenantApplicationsAsync(Guid tenantId)
    {
        var cacheKey = $"tenant_apps:{tenantId}";
        if (_memCache != null && _memCache.TryGetValue(cacheKey, out List<RentalApplicationResponseDto>? cached) && cached != null)
        {
            return ServiceResult<List<RentalApplicationResponseDto>>.Ok(cached);
        }

        var applications = await _db.RentalApplications
            .AsNoTracking()
            .Where(a => a.TenantId == tenantId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new RentalApplicationResponseDto
            {
                Id = a.Id,
                RoomId = a.RoomId,
                RoomTitle = a.Room.Title,
                RoomAddress = a.Room.Address,
                RoomPrice = a.Room.Price,
                RoomImageUrl = a.Room.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
                TenantId = a.TenantId,
                TenantName = !string.IsNullOrWhiteSpace(a.Tenant.FullName) ? a.Tenant.FullName : (!string.IsNullOrWhiteSpace(a.Tenant.Email) ? a.Tenant.Email : "Khách thuê"),
                TenantEmail = a.Tenant.Email,
                TenantPhone = a.Tenant.PhoneNumber,
                TenantAvatar = a.Tenant.AvatarUrl,
                IsTenantVerified = a.Tenant.IsVerified,
                LandlordId = a.Room.LandlordId,
                LandlordName = !string.IsNullOrWhiteSpace(a.Room.Landlord.FullName) ? a.Room.Landlord.FullName : (!string.IsNullOrWhiteSpace(a.Room.Landlord.Email) ? a.Room.Landlord.Email : "Chủ trọ"),
                Status = a.Status,
                MonthlyIncome = a.MonthlyIncome,
                Occupation = a.Occupation,
                EmployerName = a.EmployerName,
                OccupantsCount = a.OccupantsCount,
                DesiredMoveInDate = a.DesiredMoveInDate,
                LeaseDurationMonths = a.LeaseDurationMonths,
                NoteToLandlord = a.NoteToLandlord,
                RejectionReason = a.RejectionReason,
                LandlordNotes = a.LandlordNotes,
                CreatedAt = a.CreatedAt,
                ReviewedAt = a.ReviewedAt,
                Documents = a.Documents.Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    FileUrl = d.FileUrl,
                    UploadedAt = d.UploadedAt
                }).ToList()
            })
            .ToListAsync();

        _memCache?.Set(cacheKey, applications, TimeSpan.FromMinutes(2));
        return ServiceResult<List<RentalApplicationResponseDto>>.Ok(applications);
    }

    public async Task<ServiceResult<List<RentalApplicationResponseDto>>> GetLandlordApplicationsAsync(Guid landlordId, ApplicationStatus? status = null, bool isAdmin = false)
    {
        var cacheKey = $"landlord_apps:{landlordId}:{(status.HasValue ? status.Value.ToString() : "all")}:{(isAdmin ? "admin" : "user")}";
        if (_memCache != null && _memCache.TryGetValue(cacheKey, out List<RentalApplicationResponseDto>? cached) && cached != null)
        {
            return ServiceResult<List<RentalApplicationResponseDto>>.Ok(cached);
        }

        var query = _db.RentalApplications.AsNoTracking();

        if (!isAdmin)
        {
            var landlordRoomIds = await _db.Rooms
                .AsNoTracking()
                .Where(r => r.LandlordId == landlordId)
                .Select(r => r.Id)
                .ToListAsync();

            if (landlordRoomIds.Count == 0)
            {
                var empty = new List<RentalApplicationResponseDto>();
                _memCache?.Set(cacheKey, empty, TimeSpan.FromMinutes(2));
                return ServiceResult<List<RentalApplicationResponseDto>>.Ok(empty);
            }

            query = query.Where(a => landlordRoomIds.Contains(a.RoomId));
        }

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        var applications = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new RentalApplicationResponseDto
            {
                Id = a.Id,
                RoomId = a.RoomId,
                RoomTitle = a.Room.Title,
                RoomAddress = a.Room.Address,
                RoomPrice = a.Room.Price,
                RoomImageUrl = a.Room.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
                TenantId = a.TenantId,
                TenantName = !string.IsNullOrWhiteSpace(a.Tenant.FullName) ? a.Tenant.FullName : (!string.IsNullOrWhiteSpace(a.Tenant.Email) ? a.Tenant.Email : "Khách thuê"),
                TenantEmail = a.Tenant.Email,
                TenantPhone = a.Tenant.PhoneNumber,
                TenantAvatar = a.Tenant.AvatarUrl,
                IsTenantVerified = a.Tenant.IsVerified,
                LandlordId = a.Room.LandlordId,
                LandlordName = !string.IsNullOrWhiteSpace(a.Room.Landlord.FullName) ? a.Room.Landlord.FullName : (!string.IsNullOrWhiteSpace(a.Room.Landlord.Email) ? a.Room.Landlord.Email : "Chủ trọ"),
                Status = a.Status,
                MonthlyIncome = a.MonthlyIncome,
                Occupation = a.Occupation,
                EmployerName = a.EmployerName,
                OccupantsCount = a.OccupantsCount,
                DesiredMoveInDate = a.DesiredMoveInDate,
                LeaseDurationMonths = a.LeaseDurationMonths,
                NoteToLandlord = a.NoteToLandlord,
                RejectionReason = a.RejectionReason,
                LandlordNotes = a.LandlordNotes,
                CreatedAt = a.CreatedAt,
                ReviewedAt = a.ReviewedAt,
                Documents = a.Documents.Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    FileUrl = d.FileUrl,
                    UploadedAt = d.UploadedAt
                }).ToList()
            })
            .ToListAsync();

        _memCache?.Set(cacheKey, applications, TimeSpan.FromMinutes(2));
        return ServiceResult<List<RentalApplicationResponseDto>>.Ok(applications);
    }

    public async Task<ServiceResult<RentalApplicationResponseDto>> GetApplicationByIdAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var application = await _db.RentalApplications
            .AsNoTracking()
            .Include(a => a.Room)
                .ThenInclude(r => r.Images)
            .Include(a => a.Room)
                .ThenInclude(r => r.Landlord)
            .Include(a => a.Tenant)
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application == null)
        {
            return ServiceResult<RentalApplicationResponseDto>.NotFound("Không tìm thấy hồ sơ thuê phòng.");
        }

        if (!isAdmin && application.TenantId != currentUserId && application.Room.LandlordId != currentUserId)
        {
            return ServiceResult<RentalApplicationResponseDto>.Forbidden();
        }

        return ServiceResult<RentalApplicationResponseDto>.Ok(MapToResponseDto(application, application.Room, application.Tenant));
    }

    public async Task<ServiceResult<object>> ReviewApplicationAsync(Guid id, Guid landlordId, ReviewApplicationDto dto, bool isAdmin = false)
    {
        var application = await _db.RentalApplications
            .Include(a => a.Room)
            .Include(a => a.Tenant)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy hồ sơ thuê phòng.");
        }

        if (!isAdmin && application.Room.LandlordId != landlordId)
        {
            return ServiceResult<object>.Forbidden();
        }

        if (application.Status == ApplicationStatus.Withdrawn || application.Status == ApplicationStatus.Expired)
        {
            return ServiceResult<object>.Fail("Hồ sơ đã bị rút hoặc hết hạn, không thể xử lý tiếp.", 400);
        }

        if (dto.Status == ApplicationStatus.Approved && application.Room.Status == RoomStatus.Rented)
        {
            return ServiceResult<object>.Fail("Phòng trọ này hiện đã có người thuê, không thể duyệt thêm hồ sơ.", 400);
        }

        application.Status = dto.Status;
        application.ReviewedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.Reason)) application.RejectionReason = dto.Reason;
        if (!string.IsNullOrWhiteSpace(dto.LandlordNotes)) application.LandlordNotes = dto.LandlordNotes;

        await _db.SaveChangesAsync();
        InvalidateApplicationCache(application.Room.LandlordId, application.TenantId);

        if (_kafkaProducer != null)
        {
            var statusMessage = dto.Status switch
            {
                ApplicationStatus.Approved => "Hồ sơ thuê phòng của bạn đã được CHẤP THUẬN! Hãy liên hệ chủ nhà để ký hợp đồng.",
                ApplicationStatus.Rejected => $"Hồ sơ thuê phòng của bạn đã bị TỪ CHỐI. Lý do: {dto.Reason ?? "Không có lý do cụ thể"}.",
                ApplicationStatus.MoreInfoRequested => $"Chủ nhà yêu cầu bổ sung thông tin: {dto.Reason ?? "Vui lòng xem chi tiết"}.",
                _ => $"Trạng thái hồ sơ đã chuyển sang: {dto.Status}."
            };

            var appEventType = dto.Status == ApplicationStatus.Approved ? "ApplicationApproved" : "ApplicationStatusUpdated";

            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = appEventType,
                UserId = application.TenantId,
                Title = "Cập nhật hồ sơ thuê phòng",
                Message = statusMessage,
                Type = "Application",
                LinkUrl = "/tenant/applications",
                CreatedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, object?>
                {
                    ["applicationId"] = application.Id.ToString(),
                    ["roomId"] = application.RoomId.ToString(),
                    ["status"] = dto.Status.ToString()
                }
            });
        }

        return ServiceResult<object>.Ok(new { message = $"Cập nhật hồ sơ thành công: {dto.Status}" });
    }

    public async Task<ServiceResult<object>> WithdrawApplicationAsync(Guid id, Guid tenantId)
    {
        var application = await _db.RentalApplications.FindAsync(id);
        if (application == null) return ServiceResult<object>.NotFound("Không tìm thấy hồ sơ thuê phòng.");

        if (application.TenantId != tenantId) return ServiceResult<object>.Forbidden();

        if (application.Status == ApplicationStatus.Approved)
        {
            return ServiceResult<object>.Fail("Hồ sơ đã được phê duyệt, vui lòng liên hệ chủ nhà nếu muốn hủy thỏa thuận.", 400);
        }

        application.Status = ApplicationStatus.Withdrawn;
        await _db.SaveChangesAsync();

        var room = await _db.Rooms.FindAsync(application.RoomId);
        if (room != null)
        {
            InvalidateApplicationCache(room.LandlordId, tenantId);
        }
        else
        {
            _memCache?.Remove($"tenant_apps:{tenantId}");
        }

        return ServiceResult<object>.Ok(new { message = "Đã rút hồ sơ thuê phòng." });
    }

    private void InvalidateApplicationCache(Guid landlordId, Guid tenantId)
    {
        if (_memCache == null) return;

        _memCache.Remove($"tenant_apps:{tenantId}");
        _memCache.Remove($"landlord_apps:{landlordId}:all:user");
        _memCache.Remove($"landlord_apps:{landlordId}:all:admin");

        foreach (ApplicationStatus st in Enum.GetValues<ApplicationStatus>())
        {
            _memCache.Remove($"landlord_apps:{landlordId}:{st}:user");
            _memCache.Remove($"landlord_apps:{landlordId}:{st}:admin");
        }
    }

    private static RentalApplicationResponseDto MapToResponseDto(RentalApplication app, Room room, User tenant)
    {
        return new RentalApplicationResponseDto
        {
            Id = app.Id,
            RoomId = app.RoomId,
            RoomTitle = room.Title,
            RoomAddress = room.Address,
            RoomPrice = room.Price,
            RoomImageUrl = room.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
            TenantId = app.TenantId,
            TenantName = !string.IsNullOrWhiteSpace(tenant.FullName) ? tenant.FullName : (!string.IsNullOrWhiteSpace(tenant.Email) ? tenant.Email : "Khách thuê"),
            TenantEmail = tenant.Email,
            TenantPhone = tenant.PhoneNumber,
            TenantAvatar = tenant.AvatarUrl,
            IsTenantVerified = tenant.IsVerified,
            LandlordId = room.LandlordId,
            LandlordName = !string.IsNullOrWhiteSpace(room.Landlord?.FullName) ? room.Landlord.FullName : (!string.IsNullOrWhiteSpace(room.Landlord?.Email) ? room.Landlord.Email : "Chủ trọ"),
            Status = app.Status,
            MonthlyIncome = app.MonthlyIncome,
            Occupation = app.Occupation,
            EmployerName = app.EmployerName,
            OccupantsCount = app.OccupantsCount,
            DesiredMoveInDate = app.DesiredMoveInDate,
            LeaseDurationMonths = app.LeaseDurationMonths,
            NoteToLandlord = app.NoteToLandlord,
            RejectionReason = app.RejectionReason,
            LandlordNotes = app.LandlordNotes,
            CreatedAt = app.CreatedAt,
            ReviewedAt = app.ReviewedAt,
            Documents = app.Documents.Select(d => new ApplicationDocumentDto
            {
                Id = d.Id,
                DocumentType = d.DocumentType,
                FileUrl = d.FileUrl,
                UploadedAt = d.UploadedAt
            }).ToList()
        };
    }
}
