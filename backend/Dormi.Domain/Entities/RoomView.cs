using System;

namespace Dormi.Domain.Entities;

public class RoomView
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid? ViewerId { get; set; }
    public string EventType { get; set; } = "View"; // View, Save, Contact
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
