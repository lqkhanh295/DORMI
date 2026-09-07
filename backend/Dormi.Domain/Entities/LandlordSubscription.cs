using System;

namespace Dormi.Domain.Entities;

public class LandlordSubscription
{
    public Guid Id { get; set; }

    public Guid LandlordId { get; set; }
    public User Landlord { get; set; } = null!;

    public string PlanName { get; set; } = "Free"; // Free, Pro, Enterprise
    public decimal Price { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}
