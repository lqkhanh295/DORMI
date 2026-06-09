using System;
using System.Collections.Generic;

namespace Dormi.Domain.Entities;

public class LandlordProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public bool IsVerified { get; set; } = false;
    public string? IdentificationDocumentsUrl { get; set; }
    public string? PhoneNumber { get; set; }

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}
