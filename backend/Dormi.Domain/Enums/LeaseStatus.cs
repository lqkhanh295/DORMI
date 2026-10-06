namespace Dormi.Domain.Enums;

// ponytail: Integer enum for Lease lifecycle state machine.
public enum LeaseStatus
{
    Draft = 0,
    PendingSignature = 1,
    Active = 2,
    ExpiringSoon = 3,
    Renewed = 4,
    Terminated = 5,
    Expired = 6
}
