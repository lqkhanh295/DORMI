using System;

namespace Dormi.Domain.Entities;

public class FavoriteRoom
{
    public Guid CustomerId { get; set; }
    public CustomerProfile Customer { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
