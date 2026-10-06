namespace Dormi.Domain.Enums;

// ponytail: Integer enum for Payment Transaction state machine.
public enum PaymentStatus
{
    Pending = 0,
    Processing = 1,
    Succeeded = 2,
    Failed = 3,
    Refunded = 4,
    Disputed = 5
}
