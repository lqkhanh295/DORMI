using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Dormi.Domain.Enums;

namespace Dormi.Application.DTOs;

public class CreateApplicationDocumentDto
{
    [Required]
    public string DocumentType { get; set; } = "ID_CARD";

    [Required]
    public string FileUrl { get; set; } = string.Empty;
}

public class CreateApplicationDto
{
    [Required]
    public Guid RoomId { get; set; }

    [Range(0, 1_000_000_000)]
    public decimal MonthlyIncome { get; set; }

    [Required]
    [MaxLength(200)]
    public string Occupation { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? EmployerName { get; set; }

    [Range(1, 20)]
    public int OccupantsCount { get; set; } = 1;

    [Required]
    public DateTime DesiredMoveInDate { get; set; }

    [Range(1, 60)]
    public int LeaseDurationMonths { get; set; } = 12;

    [MaxLength(1000)]
    public string? NoteToLandlord { get; set; }

    public List<CreateApplicationDocumentDto> Documents { get; set; } = new();
}

public class ReviewApplicationDto
{
    [Required]
    public ApplicationStatus Status { get; set; } // Approved, Rejected, MoreInfoRequested

    public string? Reason { get; set; }
    public string? LandlordNotes { get; set; }
}

public class ApplicationDocumentDto
{
    public Guid Id { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

public class RentalApplicationResponseDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string RoomAddress { get; set; } = string.Empty;
    public decimal RoomPrice { get; set; }
    public string? RoomImageUrl { get; set; }

    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantEmail { get; set; } = string.Empty;
    public string? TenantPhone { get; set; }
    public string? TenantAvatar { get; set; }
    public bool IsTenantVerified { get; set; }

    public Guid LandlordId { get; set; }
    public string LandlordName { get; set; } = string.Empty;

    public ApplicationStatus Status { get; set; }
    public string StatusText => Status.ToString();

    public decimal MonthlyIncome { get; set; }
    public string Occupation { get; set; } = string.Empty;
    public string? EmployerName { get; set; }
    public int OccupantsCount { get; set; }
    public DateTime DesiredMoveInDate { get; set; }
    public int LeaseDurationMonths { get; set; }

    public string? NoteToLandlord { get; set; }
    public string? RejectionReason { get; set; }
    public string? LandlordNotes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public List<ApplicationDocumentDto> Documents { get; set; } = new();
}
