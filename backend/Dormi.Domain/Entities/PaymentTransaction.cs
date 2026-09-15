using System;

namespace Dormi.Domain.Entities;

public class PaymentTransaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? SubscriptionId { get; set; }
    public LandlordSubscription? Subscription { get; set; }

    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "VNPay"; // VNPay, MoMo, BankTransfer
    public string TransactionRef { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "Pending"; // Pending, Completed, Failed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
