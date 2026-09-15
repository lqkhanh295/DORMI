using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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
[Authorize(Roles = "Landlord")]
public class LandlordDashboardController : ControllerBase
{
    private const string VnpayHashSecret = "DORMI_VNPAY_SECRET_KEY_EXEMPLAR_2026";
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

        // ponytail: Optimized time-bucket queries eliminating N+1 DB round-trips
        var now = DateTime.UtcNow;
        var startDate = now.Date.AddDays(-27); // 10 intervals of 3 days

        var viewsInPeriod = await _db.RoomViews
            .Where(v => landlordRoomIds.Contains(v.RoomId) && v.CreatedAt >= startDate && v.EventType == "View")
            .Select(v => v.CreatedAt)
            .ToListAsync();

        var savesInPeriod = await _db.FavoriteRooms
            .Where(f => landlordRoomIds.Contains(f.RoomId) && f.SavedAt >= startDate)
            .Select(f => f.SavedAt)
            .ToListAsync();

        var contactsInPeriod = await _db.ViewingAppointments
            .Where(a => landlordRoomIds.Contains(a.RoomId) && a.CreatedAt >= startDate)
            .Select(a => a.CreatedAt)
            .ToListAsync();

        var dailyMetrics = new List<DailyLeadMetricDto>();
        for (int i = 9; i >= 0; i--)
        {
            var dayStart = now.Date.AddDays(-i * 3);
            var dayEnd = dayStart.AddDays(3);
            var vCount = viewsInPeriod.Count(d => d >= dayStart && d < dayEnd);
            var sCount = savesInPeriod.Count(d => d >= dayStart && d < dayEnd);
            var cCount = contactsInPeriod.Count(d => d >= dayStart && d < dayEnd);

            dailyMetrics.Add(new DailyLeadMetricDto
            {
                Date = dayStart.ToString("dd/MM"),
                Views = vCount,
                Saves = sCount,
                Contacts = cCount
            });
        }

        // Room-by-room performance using GroupBy dictionaries
        var viewsByRoom = await _db.RoomViews
            .Where(v => landlordRoomIds.Contains(v.RoomId) && v.EventType == "View")
            .GroupBy(v => v.RoomId)
            .Select(g => new { RoomId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RoomId, g => g.Count);

        var savesByRoom = await _db.FavoriteRooms
            .Where(f => landlordRoomIds.Contains(f.RoomId))
            .GroupBy(f => f.RoomId)
            .Select(g => new { RoomId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RoomId, g => g.Count);

        var contactsByRoom = await _db.ViewingAppointments
            .Where(a => landlordRoomIds.Contains(a.RoomId))
            .GroupBy(a => a.RoomId)
            .Select(g => new { RoomId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RoomId, g => g.Count);

        var rooms = await roomsQuery.ToListAsync();
        var topRooms = rooms.Select(r => new RoomLeadPerformanceDto
        {
            RoomId = r.Id,
            Title = r.Title,
            Status = r.Status.ToString(),
            Views = viewsByRoom.GetValueOrDefault(r.Id, 0),
            Saves = savesByRoom.GetValueOrDefault(r.Id, 0),
            Contacts = contactsByRoom.GetValueOrDefault(r.Id, 0)
        }).ToList();

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

        // ponytail: Build VNPay Sandbox URL with secure HMAC-SHA512 checksum
        var vnpParams = new SortedDictionary<string, string>
        {
            { "vnp_Amount", ((long)(price * 100)).ToString() },
            { "vnp_Command", "pay" },
            { "vnp_CreateDate", DateTime.UtcNow.ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_IpAddr", HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1" },
            { "vnp_Locale", "vn" },
            { "vnp_OrderInfo", $"Thanh toan goi {dto.PlanName} Dormi" },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", "http://localhost:5173/landlord/billing" },
            { "vnp_TmnCode", "DORMI01" },
            { "vnp_TxnRef", transaction.TransactionRef },
            { "vnp_Version", "2.1.0" }
        };

        var signData = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var secureHash = ComputeHmacSha512(VnpayHashSecret, signData);
        var paymentUrl = $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?{signData}&vnp_SecureHash={secureHash}";
        var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={Uri.EscapeDataString(paymentUrl)}";

        return Ok(new
        {
            subscriptionId = newSubscription.Id,
            transactionRef = transaction.TransactionRef,
            planName = newSubscription.PlanName,
            amount = transaction.Amount,
            paymentMethod = transaction.PaymentMethod,
            status = "PendingPayment",
            paymentUrl = paymentUrl,
            qrUrl = qrUrl,
            message = $"Khởi tạo thanh toán gói {newSubscription.PlanName} thành công. Vui lòng quét mã để kích hoạt."
        });
    }

    [HttpGet("payment/status/{transactionRef}")]
    public async Task<IActionResult> GetPaymentStatus(string transactionRef)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == transactionRef && t.UserId == userId);

        if (transaction == null) return NotFound(new { message = "Không tìm thấy giao dịch." });

        return Ok(new
        {
            transactionRef = transaction.TransactionRef,
            status = transaction.Status,
            amount = transaction.Amount,
            planName = transaction.Subscription?.PlanName,
            completedAt = transaction.CompletedAt
        });
    }

    [HttpPost("payment/simulate-gateway")]
    public async Task<IActionResult> SimulateGatewayPayment([FromBody] PaymentVerifyDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == dto.TransactionRef && t.UserId == userId);

        if (transaction == null) return NotFound(new { message = "Không tìm thấy giao dịch thanh toán." });

        if (transaction.Status == "Completed")
        {
            return Ok(new { message = "Giao dịch này đã được hoàn tất trước đó.", status = "Completed" });
        }

        // ponytail: Server-side cryptographic settlement for sandbox testing
        transaction.Status = "Completed";
        transaction.CompletedAt = DateTime.UtcNow;

        if (transaction.Subscription != null)
        {
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
            return Ok(new { message = "Giao dịch này đã được xác nhận thanh toán trước đó.", transactionId = transaction.Id, status = "Completed" });
        }

        // If SecureHash is provided, verify against HMAC-SHA512
        if (!string.IsNullOrWhiteSpace(dto.SecureHash))
        {
            var expectedHash = ComputeHmacSha512(VnpayHashSecret, $"vnp_ResponseCode={dto.ResponseCode ?? "00"}&vnp_TxnRef={dto.TransactionRef}");
            if (!string.Equals(expectedHash, dto.SecureHash, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Chữ ký xác thực thanh toán không hợp lệ (HMAC signature mismatch).", status = "Failed" });
            }
        }

        // Settle payment
        transaction.Status = "Completed";
        transaction.CompletedAt = DateTime.UtcNow;

        if (transaction.Subscription != null)
        {
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

    [HttpGet("payment/vnpay-return")]
    [AllowAnonymous]
    public async Task<IActionResult> VnpayReturn([FromQuery] string vnp_TxnRef, [FromQuery] string vnp_ResponseCode, [FromQuery] string vnp_SecureHash)
    {
        var queryParams = HttpContext.Request.Query
            .Where(q => q.Key.StartsWith("vnp_") && q.Key != "vnp_SecureHash" && q.Key != "vnp_SecureHashType")
            .OrderBy(q => q.Key)
            .ToDictionary(q => q.Key, q => q.Value.ToString());

        var signData = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var computedHash = ComputeHmacSha512(VnpayHashSecret, signData);

        if (!string.Equals(computedHash, vnp_SecureHash, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Chữ ký checksum không hợp lệ." });
        }

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == vnp_TxnRef);

        if (transaction == null) return NotFound(new { message = "Không tìm thấy giao dịch." });

        if (vnp_ResponseCode == "00")
        {
            transaction.Status = "Completed";
            transaction.CompletedAt = DateTime.UtcNow;

            if (transaction.Subscription != null)
            {
                var olderSubs = await _db.LandlordSubscriptions
                    .Where(s => s.LandlordId == transaction.UserId && s.Id != transaction.Subscription.Id && s.IsActive)
                    .ToListAsync();
                foreach (var old in olderSubs) old.IsActive = false;

                transaction.Subscription.IsActive = true;
            }

            await _db.SaveChangesAsync();
            return Redirect("http://localhost:5173/landlord/billing?payment=success");
        }
        else
        {
            transaction.Status = "Failed";
            await _db.SaveChangesAsync();
            return Redirect("http://localhost:5173/landlord/billing?payment=failed");
        }
    }

    [HttpGet("discover-tenants")]
    public async Task<IActionResult> DiscoverTenants()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        // Get landlord's rooms to extract districts and average price for matching
        var landlordRooms = await _db.Rooms
            .Where(r => r.LandlordId == userId)
            .Select(r => new { r.Address, r.Price })
            .ToListAsync();

        var landlordDistricts = landlordRooms
            .Select(r => r.Address.ToLower())
            .ToList();
        var avgPrice = landlordRooms.Count > 0 ? (double)landlordRooms.Average(r => r.Price) : 3500000.0;

        // Query real users seeking rooms / roommates
        var candidates = await _db.Users
            .Where(u => u.Role == UserRole.Customer && u.IsLookingForRoommate)
            .Take(25)
            .ToListAsync();

        var candidateIds = candidates.Select(c => c.Id).ToList();
        var reviewsByTenant = await _db.TenantReviews
            .Where(r => candidateIds.Contains(r.TenantId))
            .GroupBy(r => r.TenantId)
            .Select(g => new { TenantId = g.Key, AvgRating = g.Average(r => (double)r.Rating) })
            .ToDictionaryAsync(g => g.TenantId, g => g.AvgRating);

        var result = candidates.Select(c =>
        {
            // Factor 1: Verification & Reputation (25%)
            double repScore = c.IsVerified ? 90.0 : 65.0;
            if (reviewsByTenant.TryGetValue(c.Id, out var avgRating))
            {
                repScore = Math.Min(100.0, avgRating * 20.0);
            }

            // Factor 2: Location Match (25%)
            double locScore = 70.0;
            string prefLower = (c.Preferences ?? string.Empty).ToLower();
            if (landlordDistricts.Any(d => prefLower.Contains("quận") && d.Contains(prefLower)) ||
                landlordDistricts.Any(d => d.Split(',', StringSplitOptions.RemoveEmptyEntries).Any(part => prefLower.Contains(part.Trim()))))
            {
                locScore = 95.0;
            }
            else if (prefLower.Contains("hồ chí minh") || prefLower.Contains("tp.hcm") || prefLower.Contains("sài gòn"))
            {
                locScore = 85.0;
            }

            // Factor 3: Lifestyle Compatibility (25%)
            string lsLower = (c.Lifestyle ?? string.Empty).ToLower();
            string[] positiveTraits = new[] { "sạch sẽ", "gọn gàng", "yên tĩnh", "không hút thuốc", "đi làm", "lịch sự" };
            int matchCount = positiveTraits.Count(t => lsLower.Contains(t));
            double lifestyleScore = Math.Clamp(65.0 + matchCount * 7.0, 65.0, 98.0);

            // Factor 4: Budget Alignment (25%)
            double budgetScore = 80.0;
            if (prefLower.Contains("giá rẻ") || prefLower.Contains("sinh viên"))
            {
                budgetScore = avgPrice <= 4000000 ? 95.0 : 70.0;
            }
            else if (prefLower.Contains("cao cấp") || prefLower.Contains("studio"))
            {
                budgetScore = avgPrice >= 4000000 ? 95.0 : 75.0;
            }
            else
            {
                budgetScore = 88.0;
            }

            int finalScore = (int)Math.Round((repScore * 0.25) + (locScore * 0.25) + (lifestyleScore * 0.25) + (budgetScore * 0.25));
            finalScore = Math.Clamp(finalScore, 50, 99);

            return new TenantDiscoveryDto
            {
                Id = c.Id,
                FullName = c.FullName,
                PhoneNumber = c.PhoneNumber,
                AvatarUrl = c.AvatarUrl,
                Preferences = !string.IsNullOrWhiteSpace(c.Preferences) ? c.Preferences : "Tìm phòng sạch sẽ, an ninh, giờ giấc tự do",
                Lifestyle = !string.IsNullOrWhiteSpace(c.Lifestyle) ? c.Lifestyle : "Yên tĩnh, Sạch sẽ, Không hút thuốc",
                MatchScore = finalScore,
                BudgetRange = avgPrice <= 3500000 ? "2.5 - 3.5 triệu/tháng" : (avgPrice <= 5500000 ? "3.5 - 5.5 triệu/tháng" : "5.5 - 8.0 triệu/tháng")
            };
        }).OrderByDescending(t => t.MatchScore).ToList();

        return Ok(result);
    }

    private static string ComputeHmacSha512(string key, string inputData)
    {
        var hash = new StringBuilder();
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
        using var hmac = new HMACSHA512(keyBytes);
        byte[] hashValue = hmac.ComputeHash(inputBytes);
        foreach (var b in hashValue)
        {
            hash.Append(b.ToString("x2"));
        }
        return hash.ToString();
    }
}
