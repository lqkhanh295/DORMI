using System;

namespace Dormi.Domain.Entities;

public class ViewingAppointment
{
    public Guid Id { get; set; }
    
    public Guid CustomerId { get; set; }
    public CustomerProfile Customer { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Completed
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
