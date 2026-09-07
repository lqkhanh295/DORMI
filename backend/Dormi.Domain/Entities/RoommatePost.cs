using System;

namespace Dormi.Domain.Entities;

public class RoommatePost
{
    public Guid Id { get; set; }
    
    public Guid CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime MoveInDate { get; set; }
    public string GenderPreference { get; set; } = "Any"; // Any, Male, Female
    public string LifestyleTraits { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
