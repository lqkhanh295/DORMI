using System;

namespace Dormi.Domain.Entities;

public class LeaseContract
{
    public Guid Id { get; set; }
    
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid LandlordId { get; set; }
    public User Landlord { get; set; } = null!;

    public Guid TenantId { get; set; }
    public User Tenant { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal Deposit { get; set; }
    public string Status { get; set; } = "Active"; // Active, Completed, Terminated
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
