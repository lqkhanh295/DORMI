using System;

namespace Dormi.Domain.Entities;

public class TenantReview
{
    public Guid Id { get; set; }

    public Guid? LeaseId { get; set; }
    public Guid? LeaseContractId { get => LeaseId; set => LeaseId = value; }
    public LeaseContract? Lease { get; set; }

    public Guid LandlordId { get; set; }
    public User Landlord { get; set; } = null!;

    public Guid TenantId { get; set; }
    public User Tenant { get; set; } = null!;

    public int Rating { get; set; } // 1 to 5
    public int PunctualityScore { get; set; } = 5; // Thanh toán đúng hẹn (1-5)
    public int Punctuality { get => PunctualityScore; set => PunctualityScore = value; }

    public int CleanlinessScore { get; set; } = 5;  // Giữ gìn vệ sinh (1-5)
    public int Cleanliness { get => CleanlinessScore; set => CleanlinessScore = value; }

    public int RespectScore { get; set; } = 5;      // Chấp hành nội quy chung (1-5)
    public int Respectfulness { get => RespectScore; set => RespectScore = value; }

    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
