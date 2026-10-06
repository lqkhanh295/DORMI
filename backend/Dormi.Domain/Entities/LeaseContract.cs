using System;
using System.Collections.Generic;

namespace Dormi.Domain.Entities;

// ponytail: LeaseContract entity managing tenancy lifecycle and digital signature.
public class LeaseContract
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid? RentalApplicationId { get; set; }
    public RentalApplication? RentalApplication { get; set; }

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid LandlordId { get; set; }
    public User Landlord { get; set; } = null!;

    public Guid TenantId { get; set; }
    public User Tenant { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal Deposit { get; set; }
    
    public string? UtilitiesDescription { get; set; }
    public string? TermsAndConditions { get; set; }
    public int PaymentCycleMonths { get; set; } = 1;

    public string Status { get; set; } = "PendingSignature"; // Draft, PendingSignature, Active, ExpiringSoon, Renewed, Terminated, Expired

    public bool LandlordSigned { get; set; } = true;
    public DateTime? LandlordSignedAt { get; set; } = DateTime.UtcNow;

    public bool TenantSigned { get; set; } = false;
    public DateTime? TenantSignedAt { get; set; }
    public string? TenantSignatureData { get; set; }

    public string? ContractDocumentUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ActivatedAt { get; set; }
    public DateTime? TerminatedAt { get; set; }
    public string? TerminationReason { get; set; }

    // Move-out & deposit settlement
    public DateTime? MoveOutRequestedAt { get; set; }
    public DateTime? MoveOutDate { get; set; }
    public string? MoveOutReason { get; set; }
    public string? MoveOutInspectionNotes { get; set; }
    public decimal? MoveOutDeductions { get; set; }
    public string? MoveOutDeductionReason { get; set; }
    public decimal? MoveOutSettledDeposit { get; set; }
    public DateTime? MoveOutSettledAt { get; set; }

    // Renewal
    public DateTime? RenewalRequestedAt { get; set; }
    public DateTime? RenewalProposedEndDate { get; set; }
    public string? RenewalStatus { get; set; } // None, Requested, Accepted, Declined

    public ICollection<LeaseDocument> Documents { get; set; } = new List<LeaseDocument>();
    public ICollection<RentalPaymentSchedule> PaymentSchedules { get; set; } = new List<RentalPaymentSchedule>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
}
