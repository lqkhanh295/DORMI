using System;

namespace Dormi.Domain.Entities;

public class RoomReview
{
    public Guid Id { get; set; }

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    public int Rating { get; set; } // 1 to 5 stars
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
