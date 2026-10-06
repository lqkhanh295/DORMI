namespace Dormi.Domain.Enums;

// ponytail: Integer enum for Maintenance Request state machine.
public enum MaintenanceStatus
{
    Open = 0,
    Assigned = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4,
    Reopened = 5
}
