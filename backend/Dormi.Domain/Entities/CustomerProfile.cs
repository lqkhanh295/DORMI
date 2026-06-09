using System;
using System.Collections.Generic;

namespace Dormi.Domain.Entities;

public class CustomerProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string? Preferences { get; set; }
    public string? Lifestyle { get; set; }
    public string? DesiredRoomType { get; set; }

    public ICollection<FavoriteRoom> FavoriteRooms { get; set; } = new List<FavoriteRoom>();
    public ICollection<ViewingAppointment> ViewingAppointments { get; set; } = new List<ViewingAppointment>();
}
