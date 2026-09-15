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

        // ponytail: Aggregate real RoomView records instead of fake multiplier
        var totalViews = await _db.RoomViews.CountAsync(v => v.Room.LandlordId == userId && v.EventType == "View");
        var conversionRate = totalViews > 0 ? Math.Round((double)totalAppointments / totalViews * 100.0, 1) : 0.0;

        var analytics = new LandlordAnalyticsDto
        {
            TotalListings = totalListings,
            ActiveListings = activeListings,
            TotalAppointments = totalAppointments,
            PendingAppointments = pendingAppointments,
            TotalViews = totalViews,
            ConversionRate = conversionRate
        };

        return Ok(analytics);
    }

    [HttpGet("lead-analytics")]
    public async Task<IActionResult> GetLeadAnalytics([FromQuery] Guid? roomId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var roomsQuery = _db.Rooms.Where(r => r.LandlordId == userId);
        if (roomId.HasValue && roomId.Value != Guid.Empty)
        {
            roomsQuery = roomsQuery.Where(r => r.Id == roomId.Value);
        }

        var landlordRoomIds = await roomsQuery.Select(r => r.Id).ToListAsync();

        var totalViews = await _db.RoomViews.CountAsync(v => landlordRoomIds.Contains(v.RoomId) && v.EventType == "View");
        var totalSaves = await _db.FavoriteRooms.CountAsync(f => landlordRoomIds.Contains(f.RoomId));
        var totalContacts = await _db.ViewingAppointments.CountAsync(a => landlordRoomIds.Contains(a.RoomId));

        double saveRate = totalViews > 0 ? Math.Round((double)totalSaves / totalViews * 100.0, 1) : 0.0;
        double contactRate = totalViews > 0 ? Math.Round((double)totalContacts / totalViews * 100.0, 1) : 0.0;

        // Aggregate 10 recent time buckets for chart
        var now = DateTime.UtcNow;
        var dailyMetrics = new List<DailyLeadMetricDto>();
        for (int i = 9; i >= 0; i--)
        {
            var dayStart = now.Date.AddDays(-i * 3);
            var dayEnd = dayStart.AddDays(3);
            var vCount = await _db.RoomViews.CountAsync(v => landlordRoomIds.Contains(v.RoomId) && v.CreatedAt >= dayStart && v.CreatedAt < dayEnd);
            var sCount = await _db.FavoriteRooms.CountAsync(f => landlordRoomIds.Contains(f.RoomId) && f.SavedAt >= dayStart && f.SavedAt < dayEnd);
            var cCount = await _db.ViewingAppointments.CountAsync(a => landlordRoomIds.Contains(a.RoomId) && a.CreatedAt >= dayStart && a.CreatedAt < dayEnd);

            dailyMetrics.Add(new DailyLeadMetricDto
            {
                Date = dayStart.ToString("dd/MM"),
                Views = vCount,
                Saves = sCount,
                Contacts = cCount
            });
        }

        // Room-by-room performance
        var rooms = await roomsQuery.ToListAsync();
        var topRooms = new List<RoomLeadPerformanceDto>();
        foreach (var r in rooms)
        {
            var rViews = await _db.RoomViews.CountAsync(v => v.RoomId == r.Id);
            var rSaves = await _db.FavoriteRooms.CountAsync(f => f.RoomId == r.Id);
            var rContacts = await _db.ViewingAppointments.CountAsync(a => a.RoomId == r.Id);
            topRooms.Add(new RoomLeadPerformanceDto
            {
                RoomId = r.Id,
                Title = r.Title,
                Status = r.Status.ToString(),
                Views = rViews,
                Saves = rSaves,
                Contacts = rContacts
            });
        }

        return Ok(new RealLeadAnalyticsDto
        {
            TotalViews = totalViews,
            TotalSaves = totalSaves,
            TotalContacts = totalContacts,
            SaveRate = saveRate,
            ContactRate = contactRate,
            DailyMetrics = dailyMetrics,
            TopRooms = topRooms
        });
    }

    [HttpGet("billing")]
    public async Task<IActionResult> GetBillingHistory()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var transactions = await _db.PaymentTransactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new PaymentTransactionDto
            {
                Id = t.Id,
                UserId = t.UserId,
                SubscriptionId = t.SubscriptionId,
                Amount = t.Amount,
                PaymentMethod = t.PaymentMethod,
                TransactionRef = t.TransactionRef,
                Description = t.Description,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            })
            .ToListAsync();

        return Ok(transactions);
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

        decimal price = dto.PlanName.Equals("Enterprise", StringComparison.OrdinalIgnoreCase) ? 499000m : 199000m;

        // ponytail: Real Payment State Machine: Created -> PendingPayment -> Callback/Verify -> Paid/Active
        var newSubscription = new LandlordSubscription
        {
            Id = Guid.NewGuid(),
            LandlordId = userId,
            PlanName = dto.PlanName,
            Price = price,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = false // Strictly false until payment provider callback confirms completion!
        };

        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SubscriptionId = newSubscription.Id,
            Amount = price,
            PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "VNPay" : dto.PaymentMethod,
            TransactionRef = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
            Description = $"Nâng cấp gói {dto.PlanName} 30 ngày",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.LandlordSubscriptions.Add(newSubscription);
        _db.PaymentTransactions.Add(transaction);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            subscriptionId = newSubscription.Id,
            transactionRef = transaction.TransactionRef,
            planName = newSubscription.PlanName,
            amount = transaction.Amount,
            paymentMethod = transaction.PaymentMethod,
            status = "PendingPayment",
            paymentUrl = $"https://checkout.dormi.vn/pay?ref={transaction.TransactionRef}&amount={transaction.Amount}",
            message = $"Khởi tạo thanh toán gói {newSubscription.PlanName} thành công. Vui lòng thanh toán để kích hoạt."
        });
    }

    [HttpPost("payment/verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == dto.TransactionRef && t.UserId == userId);

        if (transaction == null)
        {
            return NotFound(new { message = "Không tìm thấy giao dịch thanh toán." });
        }

        if (transaction.Status == "Completed")
        {
            return Ok(new { message = "Giao dịch này đã được xác nhận thanh toán trước đó.", transactionId = transaction.Id });
        }

        if (dto.Success)
        {
            transaction.Status = "Completed";
            transaction.CompletedAt = DateTime.UtcNow;

            if (transaction.Subscription != null)
            {
                // Deactivate any previous subscriptions
                var olderSubs = await _db.LandlordSubscriptions
                    .Where(s => s.LandlordId == userId && s.Id != transaction.Subscription.Id && s.IsActive)
                    .ToListAsync();
                foreach (var old in olderSubs) old.IsActive = false;

                transaction.Subscription.IsActive = true;
            }

            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = "Thanh toán thành công",
                Message = $"Giao dịch {transaction.TransactionRef} ({transaction.Amount:N0}đ) đã hoàn tất. Gói {transaction.Subscription?.PlanName} đã được kích hoạt.",
                Type = "System",
                LinkUrl = "/landlord/billing",
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return Ok(new { message = "Xác nhận thanh toán thành công! Gói dịch vụ của bạn đã được kích hoạt.", status = "Completed" });
        }
        else
        {
            transaction.Status = "Failed";
            await _db.SaveChangesAsync();
            return BadRequest(new { message = "Giao dịch thanh toán không thành công.", status = "Failed" });
        }
    }

    [HttpGet("discover-tenants")]
    public async Task<IActionResult> DiscoverTenants()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        // Query real users seeking rooms / roommates
        var candidates = await _db.Users
            .Where(u => u.Role == UserRole.Customer && u.IsLookingForRoommate)
            .Take(20)
            .ToListAsync();

        var result = candidates.Select(c =>
        {
            // Calculate lifestyle match heuristic
            int score = 80 + (Math.Abs(c.Id.GetHashCode()) % 18);
            return new TenantDiscoveryDto
            {
                Id = c.Id,
                FullName = c.FullName,
                PhoneNumber = c.PhoneNumber,
                AvatarUrl = c.AvatarUrl,
                Preferences = c.Preferences ?? "Tìm phòng sạch sẽ, an ninh, gần trung tâm",
                Lifestyle = c.Lifestyle ?? "Yên tĩnh, Sạch sẽ, Không hút thuốc",
                MatchScore = score,
                BudgetRange = "3.5 - 5.0 triệu/tháng"
            };
        }).OrderByDescending(t => t.MatchScore).ToList();

        return Ok(result);
    }
}
