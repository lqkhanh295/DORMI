using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Dormi.Application.DTOs;

public class CreateLeaseDocumentDto
{
    [Required]
    public string DocumentType { get; set; } = "CONTRACT_PDF";
    
    [Required]
    public string FileUrl { get; set; } = string.Empty;
    
    public string? Title { get; set; }
}

public class CreateLeaseDto
{
    public Guid? RentalApplicationId { get; set; }

    [Required]
    public Guid RoomId { get; set; }

    [Required]
    public Guid TenantId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Range(0, 1_000_000_000)]
    public decimal MonthlyRent { get; set; }

    [Range(0, 1_000_000_000)]
    public decimal Deposit { get; set; }

    public string? UtilitiesDescription { get; set; }
    public string? TermsAndConditions { get; set; }
    public int PaymentCycleMonths { get; set; } = 1;
    public string? ContractDocumentUrl { get; set; }

    public List<CreateLeaseDocumentDto> Documents { get; set; } = new();
}

public class SignLeaseDto
{
    [Required]
    public string SignatureData { get; set; } = string.Empty;
    public bool AgreedToTerms { get; set; } = true;
}

public class TerminateLeaseDto
{
    [Required]
    [MaxLength(1000)]
    public string Reason { get; set; } = string.Empty;
}

public class LeaseDocumentDto
{
    public Guid Id { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class LeaseContractResponseDto
{
    public Guid Id { get; set; }
    public Guid? RentalApplicationId { get; set; }
    public Guid RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string RoomAddress { get; set; } = string.Empty;
    public string? RoomImageUrl { get; set; }

    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;
    public string? LandlordPhone { get; set; }
    public string LandlordEmail { get; set; } = string.Empty;

    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string? TenantPhone { get; set; }
    public string TenantEmail { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal Deposit { get; set; }
    public string? UtilitiesDescription { get; set; }
    public string? TermsAndConditions { get; set; }
    public int PaymentCycleMonths { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool LandlordSigned { get; set; }
    public DateTime? LandlordSignedAt { get; set; }

    public bool TenantSigned { get; set; }
    public DateTime? TenantSignedAt { get; set; }
    public string? TenantSignatureData { get; set; }

    public string? ContractDocumentUrl { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? TerminatedAt { get; set; }
    public string? TerminationReason { get; set; }

    public DateTime? MoveOutRequestedAt { get; set; }
    public DateTime? MoveOutDate { get; set; }
    public string? MoveOutReason { get; set; }
    public string? MoveOutInspectionNotes { get; set; }
    public decimal? MoveOutDeductions { get; set; }
    public string? MoveOutDeductionReason { get; set; }
    public decimal? MoveOutSettledDeposit { get; set; }
    public DateTime? MoveOutSettledAt { get; set; }

    public DateTime? RenewalRequestedAt { get; set; }
    public DateTime? RenewalProposedEndDate { get; set; }
    public string? RenewalStatus { get; set; }

    public List<LeaseDocumentDto> Documents { get; set; } = new();
}
