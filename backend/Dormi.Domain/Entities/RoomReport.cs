using System;

namespace Dormi.Domain.Entities;

public class RoomReport
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public string Reason { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Reviewing, Resolved, Dismissed
    public string RiskLevel { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string? EvidenceUrls { get; set; }
    public string? ModeratorNotes { get; set; }
    public string? ActionTaken { get; set; } // None, WarningIssued, RoomHidden, LandlordBanned, Dismissed
    public Guid? ModeratorId { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
