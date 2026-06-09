using System;

namespace Dormi.Domain.Entities;

public class RoomImage
{
    public Guid Id { get; set; }
    
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;
}
