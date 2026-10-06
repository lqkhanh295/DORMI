using System;
using System.Collections.Generic;
using Dormi.Domain.Enums;

namespace Dormi.Domain.Entities;

// ponytail: Core RentalApplication entity for transaction spine.
public class RentalApplication
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid TenantId { get; set; }
    public User Tenant { get; set; } = null!;

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

    public decimal MonthlyIncome { get; set; }
    public string Occupation { get; set; } = string.Empty;
    public string? EmployerName { get; set; }
    public int OccupantsCount { get; set; } = 1;
    public DateTime DesiredMoveInDate { get; set; }
    public int LeaseDurationMonths { get; set; } = 12;

    public string? NoteToLandlord { get; set; }
    public string? RejectionReason { get; set; }
    public string? LandlordNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    public ICollection<ApplicationDocument> Documents { get; set; } = new List<ApplicationDocument>();
}
