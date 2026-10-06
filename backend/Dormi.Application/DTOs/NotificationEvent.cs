using System;
using System.Collections.Generic;

namespace Dormi.Application.DTOs;

public class NotificationEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty; // e.g. "RoomPendingApproval", "RoomStatusUpdated", "AppointmentCreated", "AppointmentStatusUpdated"
    public Guid? UserId { get; set; } // Recipient user ID (null if broadcast)
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "System"; // Room, Appointment, System, Verification
    public string? LinkUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object?>? Metadata { get; set; }
}
