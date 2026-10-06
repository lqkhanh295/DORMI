using System;
using System.Collections.Generic;

namespace Dormi.Application.DTOs;

public class TrustFactorItemDto
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Points { get; set; }
    public int MaxPoints { get; set; }
    public bool Passed { get; set; }
    public string Explanation { get; set; } = string.Empty;
}

public class TrustScoreBreakdownDto
{
    public int TotalScore { get; set; }
    public string RatingLevel { get; set; } = "High"; // High (80-100), Medium (60-79), Basic (40-59), Low (<40)
    public int IdentityPoints { get; set; }
    public int PropertyPoints { get; set; }
    public int AddressAndDetailsPoints { get; set; }
    public int PhotosPoints { get; set; }
    public int HistoryPoints { get; set; }
    public int ReviewsPoints { get; set; }
    public int ReportsDeduction { get; set; }
    public List<TrustFactorItemDto> Factors { get; set; } = new();
}

public class SubmitPropertyVerificationDto
{
    public Guid? RoomId { get; set; }
    public string DocumentType { get; set; } = "PropertyCertificate"; // PropertyCertificate, BusinessLicense
    public string DocumentNumber { get; set; } = string.Empty;
    public string PropertyAddress { get; set; } = string.Empty;
    public string FrontImageUrl { get; set; } = string.Empty;
    public string BackImageUrl { get; set; } = string.Empty;
}

public class ModerationReportDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string RoomAddress { get; set; } = string.Empty;
    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;
    public Guid ReporterId { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Reviewing, Resolved, Dismissed
    public string RiskLevel { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string? EvidenceUrls { get; set; }
    public string? ModeratorNotes { get; set; }
    public string? ActionTaken { get; set; } // None, WarningIssued, RoomHidden, LandlordBanned, Dismissed
    public Guid? ModeratorId { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ResolveReportDto
{
    public string Status { get; set; } = "Resolved"; // Resolved, Dismissed
    public string ActionTaken { get; set; } = "WarningIssued"; // None, WarningIssued, RoomHidden, LandlordBanned, Dismissed
    public string ModeratorNotes { get; set; } = string.Empty;
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid? ActorId { get; set; }
    public string ActorEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}
