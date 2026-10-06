using System;

namespace Dormi.Domain.Entities;

// ponytail: Tenant -> Landlord payment schedule/invoices (Rail A)
public class RentalPaymentSchedule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid LeaseContractId { get; set; }
    public LeaseContract LeaseContract { get; set; } = null!;

    public string Type { get; set; } = "Rent"; // Deposit, Rent, Utilities, LateFee, MoveOutSettlement
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Paid, Overdue, Waived

    public DateTime? PaidAt { get; set; }
    public string? PaymentReference { get; set; }
    public string? PaymentMethod { get; set; } // BankTransfer, Cash, Online
    public string? LandlordNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
