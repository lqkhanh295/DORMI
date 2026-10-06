using System;

namespace Dormi.Domain.Entities;

// ponytail: Maintenance ticketing system for post-rental retention
public class MaintenanceRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid LeaseContractId { get; set; }
    public LeaseContract LeaseContract { get; set; } = null!;

    public Guid TenantId { get; set; }
    public User Tenant { get; set; } = null!;

    public Guid LandlordId { get; set; }
    public User Landlord { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // Electricity, Plumbing, AirConditioner, Appliance, Structural, Other
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
    public string Status { get; set; } = "OPEN"; // OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED

    public string? ImageUrls { get; set; }
    public string? AssignedTo { get; set; }
    public string? ResolutionNotes { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }

    public bool TenantConfirmed { get; set; } = false;
    public string? TenantFeedback { get; set; }
    public int? TenantRating { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}
