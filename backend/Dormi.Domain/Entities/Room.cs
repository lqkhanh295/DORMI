using System;
using System.Collections.Generic;
using Dormi.Domain.Enums;

namespace Dormi.Domain.Entities;

public class Room
{
    public Guid Id { get; set; }
    
    public Guid LandlordId { get; set; }
    public User Landlord { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }
    public string Utilities { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public NetTopologySuite.Geometries.Point? Location { get; set; }

    public string? Virtual3DUrl { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RoomImage> Images { get; set; } = new List<RoomImage>();
    public ICollection<ViewingAppointment> Appointments { get; set; } = new List<ViewingAppointment>();
    public ICollection<FavoriteRoom> FavoritedBy { get; set; } = new List<FavoriteRoom>();
}
