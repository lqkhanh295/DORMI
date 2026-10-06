using System;

namespace Dormi.Domain.Entities;

public class VerificationRequest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }
    public string? PropertyAddress { get; set; }

    public string DocumentType { get; set; } = "CCCD"; // CCCD, PropertyCertificate, BusinessLicense
    public string DocumentNumber { get; set; } = string.Empty;
    public string FrontImageUrl { get; set; } = string.Empty;
    public string BackImageUrl { get; set; } = string.Empty;

    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? RejectReason { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewerId { get; set; }
}
