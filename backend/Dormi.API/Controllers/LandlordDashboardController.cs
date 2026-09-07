using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/landlord")]
[Authorize]
public class LandlordDashboardController : ControllerBase
{
    private readonly DormiDbContext _db;

    public LandlordDashboardController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var totalListings = await _db.Rooms.CountAsync(r => r.LandlordId == userId);
        var activeListings = await _db.Rooms.CountAsync(r => r.LandlordId == userId && r.Status == RoomStatus.Available);
        var totalAppointments = await _db.ViewingAppointments.CountAsync(a => a.Room.LandlordId == userId);
        var pendingAppointments = await _db.ViewingAppointments.CountAsync(a => a.Room.LandlordId == userId && a.Status == "Pending");

        var analytics = new LandlordAnalyticsDto
        {
            TotalListings = totalListings,
            ActiveListings = activeListings,
            TotalAppointments = totalAppointments,
            PendingAppointments = pendingAppointments,
            TotalViews = totalListings * 142 + 25,
            ConversionRate = totalListings > 0 ? Math.Round((double)totalAppointments / (totalListings * 142 + 25) * 100, 1) : 0.0
        };

        return Ok(analytics);
    }

    [HttpGet("billing")]
    public async Task<IActionResult> GetBillingHistory()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var subscriptions = await _db.LandlordSubscriptions
            .Where(s => s.LandlordId == userId)
            .OrderByDescending(s => s.StartDate)
            .Select(s => new SubscriptionDto
            {
                Id = s.Id,
                PlanName = s.PlanName,
                Price = s.Price,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                IsActive = s.IsActive
            })
            .ToListAsync();

        return Ok(subscriptions);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutSubscription([FromBody] CheckoutDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return BadRequest(new { message = "Bạn cần là Chủ trọ để đăng ký gói dịch vụ." });
        }

        var existingSubs = await _db.LandlordSubscriptions.Where(s => s.LandlordId == userId && s.IsActive).ToListAsync();
        foreach (var sub in existingSubs)
        {
            sub.IsActive = false;
        }

        decimal price = dto.PlanName.Equals("Enterprise", StringComparison.OrdinalIgnoreCase) ? 499000m : 199000m;

        var newSubscription = new LandlordSubscription
        {
            Id = Guid.NewGuid(),
            LandlordId = userId,
            PlanName = dto.PlanName,
            Price = price,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = true
        };

        _db.LandlordSubscriptions.Add(newSubscription);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            subscriptionId = newSubscription.Id,
            planName = newSubscription.PlanName,
            price = newSubscription.Price,
            paymentUrl = $"https://checkout.dormi.vn/pay?subId={newSubscription.Id}",
            message = $"Đăng ký gói {newSubscription.PlanName} thành công!"
        });
    }
}
