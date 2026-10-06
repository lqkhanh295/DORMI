using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;

namespace Dormi.Infrastructure.Services;

// ponytail: Transparent Trust Score Engine & Moderation Queue
public class TrustSafetyService : ITrustSafetyService
{
    private readonly DormiDbContext _db;
    private readonly IKafkaProducer? _kafkaProducer;

    public TrustSafetyService(DormiDbContext db, IKafkaProducer? kafkaProducer = null)
    {
        _db = db;
        _kafkaProducer = kafkaProducer;
    }

    public async Task<ServiceResult<TrustScoreBreakdownDto>> CalculateTrustScoreAsync(Guid roomId)
    {
        var room = await _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .FirstOrDefaultAsync(r => r.Id == roomId);

        if (room == null) return ServiceResult<TrustScoreBreakdownDto>.NotFound("Không tìm thấy thông tin phòng.");

        var landlord = room.Landlord;
        var factors = new List<TrustFactorItemDto>();

        // 1. Identity Verification (+20 max)
        bool hasVerifiedIdentity = landlord.IsVerified || await _db.VerificationRequests
            .AnyAsync(v => v.UserId == landlord.Id && v.DocumentType == "CCCD" && v.Status == "Approved");
        int identityPts = hasVerifiedIdentity ? 20 : 0;
        factors.Add(new TrustFactorItemDto
        {
            Key = "identity",
            Label = "Xác thực danh tính chủ trọ (CCCD)",
            Points = identityPts,
            MaxPoints = 20,
            Passed = hasVerifiedIdentity,
            Explanation = hasVerifiedIdentity 
                ? "Chủ trọ đã xác thực căn cước công dân gắn chip qua hệ thống kiểm duyệt." 
                : "Chủ trọ chưa xác thực căn cước công dân."
        });

        // 2. Property Ownership Verification (+20 max)
        bool hasVerifiedProperty = room.IsPropertyVerified || await _db.VerificationRequests
            .AnyAsync(v => (v.RoomId == room.Id || v.UserId == landlord.Id) && v.DocumentType == "PropertyCertificate" && v.Status == "Approved");
        int propertyPts = hasVerifiedProperty ? 20 : 0;
        factors.Add(new TrustFactorItemDto
        {
            Key = "property",
            Label = "Xác thực chủ quyền bất động sản",
            Points = propertyPts,
            MaxPoints = 20,
            Passed = hasVerifiedProperty,
            Explanation = hasVerifiedProperty
                ? "Đã kiểm duyệt giấy chứng nhận quyền sở hữu nhà / hợp đồng ủy quyền quản lý bất động sản."
                : "Chưa nộp hoặc chưa kiểm duyệt giấy chứng nhận quyền sở hữu nhà."
        });

        // 3. Address & Room Details (+15 max)
        bool hasGeoLocation = room.Latitude.HasValue && room.Longitude.HasValue && !string.IsNullOrWhiteSpace(room.Address);
        bool hasVirtualTour = !string.IsNullOrWhiteSpace(room.Virtual3DUrl);
        int addressPts = (hasGeoLocation ? 10 : 0) + (hasVirtualTour ? 5 : 0);
        factors.Add(new TrustFactorItemDto
        {
            Key = "address_details",
            Label = "Địa chỉ thực tế & Tọa độ bản đồ",
            Points = addressPts,
            MaxPoints = 15,
            Passed = addressPts >= 10,
            Explanation = hasGeoLocation
                ? (hasVirtualTour ? "Địa chỉ đầy đủ, định vị bản đồ chính xác và có tour thực tế ảo 3D." : "Địa chỉ cụ thể và có tọa độ định vị GPS chính xác.")
                : "Địa chỉ phòng chưa hoàn thiện tọa độ GPS."
        });

        // 4. Photos Authenticity (+15 max)
        int photoCount = room.Images?.Count ?? 0;
        int photoPts = photoCount >= 3 ? 15 : (photoCount >= 1 ? 8 : 0);
        factors.Add(new TrustFactorItemDto
        {
            Key = "photos",
            Label = "Hình ảnh thực tế phòng",
            Points = photoPts,
            MaxPoints = 15,
            Passed = photoPts >= 15,
            Explanation = photoCount >= 3
                ? $"Có {photoCount} hình ảnh phòng chụp thực tế với độ phân giải cao."
                : (photoCount >= 1 ? "Có ảnh chụp nhưng dưới 3 ảnh thực tế." : "Chưa có ảnh chụp thực tế.")
        });

        // 5. Landlord Rental History & Track Record (+15 max)
        bool isEstablishedAccount = (DateTime.UtcNow - landlord.CreatedAt).TotalDays >= 14;
        bool hasPastTransactions = await _db.ViewingAppointments.AnyAsync(a => a.RoomId == room.Id && a.Status == "Completed")
            || await _db.LeaseContracts.AnyAsync(l => l.RoomId == room.Id);
        int historyPts = (isEstablishedAccount ? 5 : 2) + (hasPastTransactions ? 10 : 3);
        factors.Add(new TrustFactorItemDto
        {
            Key = "history",
            Label = "Lịch sử vận hành & Hoạt động thực tế",
            Points = historyPts,
            MaxPoints = 15,
            Passed = historyPts >= 10,
            Explanation = hasPastTransactions
                ? "Chủ trọ có lịch sử đón khách xem phòng và giao dịch thuê thực tế trên hệ thống."
                : "Chủ trọ mới tham gia nền tảng, chưa có nhiều lượt giao dịch."
        });

        // 6. Reviews & Rating (+10 max)
        var reviews = await _db.RoomReviews.Where(r => r.RoomId == room.Id).ToListAsync();
        int reviewPts = 5; // Neutral base if no reviews
        string reviewExplain = "Chưa có đánh giá (Hệ thống tính điểm khởi điểm trung lập 5/10).";
        if (reviews.Count > 0)
        {
            double avgRating = reviews.Average(r => r.Rating);
            if (avgRating >= 4.5) { reviewPts = 10; reviewExplain = $"Đánh giá xuất sắc ({avgRating:F1} sao từ {reviews.Count} người thuê)."; }
            else if (avgRating >= 4.0) { reviewPts = 8; reviewExplain = $"Đánh giá tốt ({avgRating:F1} sao từ {reviews.Count} người thuê)."; }
            else if (avgRating >= 3.0) { reviewPts = 6; reviewExplain = $"Đánh giá trung bình ({avgRating:F1} sao từ {reviews.Count} người thuê)."; }
            else { reviewPts = 2; reviewExplain = $"Đánh giá thấp ({avgRating:F1} sao)."; }
        }
        factors.Add(new TrustFactorItemDto
        {
            Key = "reviews",
            Label = "Đánh giá từ người thuê trước",
            Points = reviewPts,
            MaxPoints = 10,
            Passed = reviewPts >= 7,
            Explanation = reviewExplain
        });

        // 7. Reports & Deductions (-N pts)
        int unresolvedReports = await _db.RoomReports.CountAsync(r => r.RoomId == room.Id && r.Status != "Dismissed");
        int reportsDeduction = unresolvedReports * 15;
        if (reportsDeduction > 0)
        {
            factors.Add(new TrustFactorItemDto
            {
                Key = "reports_penalty",
                Label = "Điểm trừ vi phạm / Khiếu nại",
                Points = -reportsDeduction,
                MaxPoints = 0,
                Passed = false,
                Explanation = $"Bị trừ {reportsDeduction} điểm do đang có {unresolvedReports} báo cáo phản ánh từ người dùng."
            });
        }

        int totalScore = Math.Clamp(identityPts + propertyPts + addressPts + photoPts + historyPts + reviewPts - reportsDeduction, 0, 100);

        string ratingLevel = totalScore >= 80 ? "High" : (totalScore >= 60 ? "Medium" : (totalScore >= 40 ? "Basic" : "Low"));

        var breakdown = new TrustScoreBreakdownDto
        {
            TotalScore = totalScore,
            RatingLevel = ratingLevel,
            IdentityPoints = identityPts,
            PropertyPoints = propertyPts,
            AddressAndDetailsPoints = addressPts,
            PhotosPoints = photoPts,
            HistoryPoints = historyPts,
            ReviewsPoints = reviewPts,
            ReportsDeduction = reportsDeduction,
            Factors = factors
        };

        return ServiceResult<TrustScoreBreakdownDto>.Ok(breakdown);
    }

    public async Task<ServiceResult<object>> SubmitPropertyVerificationAsync(Guid landlordId, SubmitPropertyVerificationDto dto)
    {
        var landlord = await _db.Users.FindAsync(landlordId);
        if (landlord == null) return ServiceResult<object>.NotFound("Không tìm thấy chủ trọ.");

        var req = new VerificationRequest
        {
            Id = Guid.NewGuid(),
            UserId = landlordId,
            RoomId = dto.RoomId,
            DocumentType = string.IsNullOrWhiteSpace(dto.DocumentType) ? "PropertyCertificate" : dto.DocumentType,
            DocumentNumber = dto.DocumentNumber,
            PropertyAddress = dto.PropertyAddress,
            FrontImageUrl = dto.FrontImageUrl,
            BackImageUrl = dto.BackImageUrl,
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };

        _db.VerificationRequests.Add(req);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Đã gửi hồ sơ xác thực chủ quyền nhà. Ban quản trị sẽ thẩm định trong 24h.", requestId = req.Id });
    }

    public async Task<ServiceResult<List<ModerationReportDto>>> GetModerationQueueAsync(string? status, string? riskLevel)
    {
        var query = _db.RoomReports
            .Include(r => r.Room).ThenInclude(rm => rm.Landlord)
            .Include(r => r.Reporter)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(r => r.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(riskLevel) && riskLevel != "all")
        {
            query = query.Where(r => r.RiskLevel == riskLevel);
        }

        var list = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ModerationReportDto
            {
                Id = r.Id,
                RoomId = r.RoomId,
                RoomTitle = r.Room.Title,
                RoomAddress = r.Room.Address,
                LandlordId = r.Room.LandlordId,
                LandlordName = r.Room.Landlord.FullName,
                ReporterId = r.ReporterId,
                ReporterName = r.Reporter.FullName,
                ReporterEmail = r.Reporter.Email,
                Reason = r.Reason,
                Details = r.Details,
                Status = r.Status,
                RiskLevel = r.RiskLevel,
                EvidenceUrls = r.EvidenceUrls,
                ModeratorNotes = r.ModeratorNotes,
                ActionTaken = r.ActionTaken,
                ModeratorId = r.ModeratorId,
                ResolvedAt = r.ResolvedAt,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return ServiceResult<List<ModerationReportDto>>.Ok(list);
    }

    public async Task<ServiceResult<object>> ResolveReportAsync(Guid reportId, Guid moderatorId, string moderatorEmail, ResolveReportDto dto)
    {
        var report = await _db.RoomReports
            .Include(r => r.Room).ThenInclude(rm => rm.Landlord)
            .Include(r => r.Reporter)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null) return ServiceResult<object>.NotFound("Không tìm thấy báo cáo vi phạm.");

        report.Status = dto.Status;
        report.ActionTaken = dto.ActionTaken;
        report.ModeratorNotes = dto.ModeratorNotes;
        report.ModeratorId = moderatorId;
        report.ResolvedAt = DateTime.UtcNow;

        // Apply Moderation Actions
        if (dto.ActionTaken == "RoomHidden")
        {
            report.Room.Status = RoomStatus.Hidden;
        }

        // Write Audit Log
        _db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = moderatorId,
            ActorEmail = moderatorEmail,
            Action = "ResolveReport",
            EntityType = "RoomReport",
            EntityId = report.Id.ToString(),
            Details = $"Xử lý báo cáo phòng '{report.Room.Title}'. Hành động: {dto.ActionTaken}. Ghi chú: {dto.ModeratorNotes}",
            CreatedAt = DateTime.UtcNow
        });

        // Notify Landlord
        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = report.Room.LandlordId,
            Title = "Kết quả xử lý phản ánh tin đăng",
            Message = $"Báo cáo phản ánh cho phòng '{report.Room.Title}' đã được xử lý. Kết quả: {dto.ActionTaken}. Ghi chú: {dto.ModeratorNotes}",
            Type = "Room",
            LinkUrl = $"/rooms/{report.RoomId}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Đã hoàn tất xử lý báo cáo vi phạm và ghi nhật ký kiểm duyệt." });
    }

    public async Task<ServiceResult<List<AuditLogDto>>> GetAuditLogsAsync(int limit = 50)
    {
        var logs = await _db.AuditLogs
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                ActorId = a.ActorId,
                ActorEmail = a.ActorEmail,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Details = a.Details,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return ServiceResult<List<AuditLogDto>>.Ok(logs);
    }
}
