using System;

namespace Dormi.Domain.Entities;

// ponytail: ViewingAppointment with complete 7-state lifecycle tracking.
public class ViewingAppointment
{
    public Guid Id { get; set; }
    
    public Guid CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = "Requested"; // Requested, Confirmed, Rescheduled, Completed, Cancelled, Rejected, NoShow
    public string? Notes { get; set; }
    public DateTime? RescheduledDate { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
