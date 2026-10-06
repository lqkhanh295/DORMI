namespace Dormi.Domain.Enums;

// ponytail: Integer enum for Viewing lifecycle state machine.
public enum ViewingStatus
{
    Requested = 0,
    Confirmed = 1,
    Rescheduled = 2,
    Completed = 3,
    Cancelled = 4,
    Rejected = 5,
    NoShow = 6
}
