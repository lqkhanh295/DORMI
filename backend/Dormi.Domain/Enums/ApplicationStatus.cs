namespace Dormi.Domain.Enums;

// ponytail: Integer enum for Rental Application state machine.
public enum ApplicationStatus
{
    Draft = 0,
    Submitted = 1,
    UnderReview = 2,
    MoreInfoRequested = 3,
    Approved = 4,
    Rejected = 5,
    Withdrawn = 6,
    Expired = 7
}
