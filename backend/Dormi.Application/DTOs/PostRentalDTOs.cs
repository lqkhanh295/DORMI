using System;
using System.Collections.Generic;

namespace Dormi.Application.DTOs;

// =========================================================================
// RAIL A: TENANT -> LANDLORD RENTAL PAYMENT INVOICES / SCHEDULES
// =========================================================================

public class RentalPaymentScheduleDto
{
    public Guid Id { get; set; }
    public Guid LeaseContractId { get; set; }
    public string Type { get; set; } = "Rent";
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Paid, Overdue, Waived
    public DateTime? PaidAt { get; set; }
    public string? PaymentReference { get; set; }
    public string? PaymentMethod { get; set; }
    public string? LandlordNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePaymentScheduleDto
{
    public Guid LeaseContractId { get; set; }
    public string Type { get; set; } = "Rent"; // Deposit, Rent, Utilities, LateFee, MoveOutSettlement
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string? LandlordNotes { get; set; }
}

public class RecordPaymentDto
{
    public string? PaymentMethod { get; set; } = "BankTransfer";
    public string? PaymentReference { get; set; }
    public string? LandlordNotes { get; set; }
    public bool MarkAsPaid { get; set; } = true;
}

// =========================================================================
// MAINTENANCE TICKETING SYSTEM
// =========================================================================

public class MaintenanceRequestDto
{
    public Guid Id { get; set; }
    public Guid LeaseContractId { get; set; }
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "OPEN";
    public string? ImageUrls { get; set; }
    public string? AssignedTo { get; set; }
    public string? ResolutionNotes { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public bool TenantConfirmed { get; set; }
    public string? TenantFeedback { get; set; }
    public int? TenantRating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}

public class CreateMaintenanceRequestDto
{
    public Guid LeaseContractId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // Electricity, Plumbing, AirConditioner, Appliance, Structural, Other
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
    public string? ImageUrls { get; set; }
}

public class UpdateMaintenanceStatusDto
{
    public string Status { get; set; } = "IN_PROGRESS"; // ASSIGNED, IN_PROGRESS, RESOLVED
    public string? AssignedTo { get; set; }
    public string? ResolutionNotes { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
}

public class ConfirmMaintenanceResolutionDto
{
    public string? TenantFeedback { get; set; }
    public int? TenantRating { get; set; } = 5;
}

// =========================================================================
// POST-RENTAL: RENEWAL & MOVE-OUT SETTLEMENT
// =========================================================================

public class RequestRenewalDto
{
    public DateTime ProposedEndDate { get; set; }
    public string? Notes { get; set; }
}

public class RespondRenewalDto
{
    public bool Accepted { get; set; }
    public DateTime? CounterEndDate { get; set; }
    public string? Reason { get; set; }
}

public class RequestMoveOutDto
{
    public DateTime ProposedMoveOutDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class MoveOutInspectionDto
{
    public string InspectionNotes { get; set; } = string.Empty;
    public decimal DeductionsAmount { get; set; } = 0;
    public string? DeductionReason { get; set; }
    public bool ConfirmCheckout { get; set; } = true;
}

public class PostRentalSummaryDto
{
    public Guid LeaseId { get; set; }
    public string LeaseStatus { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal Deposit { get; set; }
    public decimal? NextPaymentAmount { get; set; }
    public DateTime? NextPaymentDueDate { get; set; }
    public int PendingPaymentsCount { get; set; }
    public int ActiveMaintenanceCount { get; set; }
    public bool IsRenewalRequested { get; set; }
    public bool IsMoveOutRequested { get; set; }
}
