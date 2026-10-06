using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

namespace Dormi.Infrastructure.Services;

public class LandlordDashboardService : ILandlordDashboardService
{
    private readonly DormiDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _env;
    private readonly IDistributedCache? _cache;

    public LandlordDashboardService(
        DormiDbContext db, 
        IConfiguration configuration, 
        IWebHostEnvironment env,
        IDistributedCache? cache = null)
    {
        _db = db;
        _configuration = configuration;
        _env = env;
        _cache = cache;
    }

    private string GetVnpaySecret() => 
        _configuration["Vnpay:HashSecret"] ?? _configuration["VNPAY_HASH_SECRET"] ?? "DORMI_VNPAY_SECRET_KEY_EXEMPLAR_2026";

    public async Task<ServiceResult<LandlordAnalyticsDto>> GetAnalyticsAsync(Guid landlordId)
    {
        var cacheKey = $"landlord_analytics:{landlordId}";
        if (_cache != null)
        {
            var cached = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cached))
            {
                try
                {
                    var cachedDto = JsonSerializer.Deserialize<LandlordAnalyticsDto>(cached);
                    if (cachedDto != null) return ServiceResult<LandlordAnalyticsDto>.Ok(cachedDto);
                }
                catch { }
            }
        }

        var totalListings = await _db.Rooms.CountAsync(r => r.LandlordId == landlordId);
        var activeListings = await _db.Rooms.CountAsync(r => r.LandlordId == landlordId && r.Status == RoomStatus.Available);
        var totalAppointments = await _db.ViewingAppointments.CountAsync(a => a.Room.LandlordId == landlordId);
        var pendingAppointments = await _db.ViewingAppointments.CountAsync(a => a.Room.LandlordId == landlordId && a.Status == "Pending");

        var totalViews = await _db.RoomViews.CountAsync(v => v.Room.LandlordId == landlordId && v.EventType == "View");
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

        if (_cache != null)
        {
            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(analytics), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            catch { }
        }

        return ServiceResult<LandlordAnalyticsDto>.Ok(analytics);
    }

    public async Task<ServiceResult<RealLeadAnalyticsDto>> GetLeadAnalyticsAsync(Guid landlordId, Guid? roomId)
    {
        var cacheKey = $"landlord_leads:{landlordId}:{(roomId.HasValue && roomId.Value != Guid.Empty ? roomId.Value.ToString() : "all")}";
        if (_cache != null)
        {
            var cached = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cached))
            {
                try
                {
                    var cachedDto = JsonSerializer.Deserialize<RealLeadAnalyticsDto>(cached);
                    if (cachedDto != null) return ServiceResult<RealLeadAnalyticsDto>.Ok(cachedDto);
                }
                catch { }
            }
        }

        var roomsQuery = _db.Rooms.Where(r => r.LandlordId == landlordId);
        if (roomId.HasValue && roomId.Value != Guid.Empty)
        {
            roomsQuery = roomsQuery.Where(r => r.Id == roomId.Value);
        }

        var landlordRoomIds = await roomsQuery.Select(r => r.Id).ToListAsync();

        var totalViews = await _db.RoomViews.CountAsync(v => landlordRoomIds.Contains(v.RoomId) && v.EventType == "View");
        var totalSaves = await _db.FavoriteRooms.CountAsync(f => landlordRoomIds.Contains(f.RoomId));
        var totalViewings = await _db.ViewingAppointments.CountAsync(a => landlordRoomIds.Contains(a.RoomId));
        var totalApplications = await _db.RentalApplications.CountAsync(app => landlordRoomIds.Contains(app.RoomId));
        var totalApproved = await _db.RentalApplications.CountAsync(app => landlordRoomIds.Contains(app.RoomId) && app.Status == ApplicationStatus.Approved);
        var totalLeases = await _db.LeaseContracts.CountAsync(l => landlordRoomIds.Contains(l.RoomId) && (l.Status == "Active" || l.Status == "Renewed" || l.Status == "Terminated"));

        var totalContacts = totalViewings;
        var totalInquiries = totalSaves;

        double saveRate = totalViews > 0 ? Math.Round((double)totalSaves / totalViews * 100.0, 1) : 0.0;
        double contactRate = totalViews > 0 ? Math.Round((double)totalViewings / totalViews * 100.0, 1) : 0.0;
        double viewToLeadRate = totalViews > 0 ? Math.Round((double)totalSaves / totalViews * 100.0, 1) : 0.0;
        double leadToViewingRate = totalSaves > 0 ? Math.Round((double)totalViewings / totalSaves * 100.0, 1) : 0.0;
        double viewingToAppRate = totalViewings > 0 ? Math.Round((double)totalApplications / totalViewings * 100.0, 1) : 0.0;
        double appToApproveRate = totalApplications > 0 ? Math.Round((double)totalApproved / totalApplications * 100.0, 1) : 0.0;
        double approveToLeaseRate = totalApproved > 0 ? Math.Round((double)totalLeases / totalApproved * 100.0, 1) : 0.0;
        double overallConversionRate = totalViews > 0 ? Math.Round((double)totalLeases / totalViews * 100.0, 2) : 0.0;

        var now = DateTime.UtcNow;
        var startDate = now.Date.AddDays(-27);

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

        var viewingsByRoom = await _db.ViewingAppointments
            .Where(a => landlordRoomIds.Contains(a.RoomId))
            .GroupBy(a => a.RoomId)
            .Select(g => new { RoomId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RoomId, g => g.Count);

        var appsByRoom = await _db.RentalApplications
            .Where(app => landlordRoomIds.Contains(app.RoomId))
            .GroupBy(app => app.RoomId)
            .Select(g => new { RoomId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RoomId, g => g.Count);

        var leasesByRoom = await _db.LeaseContracts
            .Where(l => landlordRoomIds.Contains(l.RoomId) && (l.Status == "Active" || l.Status == "Renewed"))
            .GroupBy(l => l.RoomId)
            .Select(g => new { RoomId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RoomId, g => g.Count);

        var rooms = await roomsQuery.Include(r => r.Images).ToListAsync();
        var topRooms = rooms.Select(r => new RoomLeadPerformanceDto
        {
            RoomId = r.Id,
            Title = r.Title,
            Status = r.Status.ToString(),
            Price = r.Price,
            Address = r.Address,
            ImageUrl = r.Images.FirstOrDefault()?.ImageUrl,
            Views = viewsByRoom.GetValueOrDefault(r.Id, 0),
            Saves = savesByRoom.GetValueOrDefault(r.Id, 0),
            Contacts = viewingsByRoom.GetValueOrDefault(r.Id, 0),
            Viewings = viewingsByRoom.GetValueOrDefault(r.Id, 0),
            Applications = appsByRoom.GetValueOrDefault(r.Id, 0),
            Leases = leasesByRoom.GetValueOrDefault(r.Id, 0),
            IsBoosted = r.IsBoosted && r.BoostExpiresAt > now,
            BoostType = r.BoostType,
            BoostExpiresAt = r.BoostExpiresAt
        }).ToList();

        var resultDto = new RealLeadAnalyticsDto
        {
            TotalViews = totalViews,
            TotalSaves = totalSaves,
            TotalContacts = totalContacts,
            TotalInquiries = totalInquiries,
            TotalViewings = totalViewings,
            TotalApplications = totalApplications,
            TotalApproved = totalApproved,
            TotalLeases = totalLeases,
            SaveRate = saveRate,
            ContactRate = contactRate,
            ViewToLeadRate = viewToLeadRate,
            LeadToViewingRate = leadToViewingRate,
            ViewingToAppRate = viewingToAppRate,
            AppToApproveRate = appToApproveRate,
            ApproveToLeaseRate = approveToLeaseRate,
            OverallConversionRate = overallConversionRate,
            DailyMetrics = dailyMetrics,
            TopRooms = topRooms
        };

        if (_cache != null)
        {
            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(resultDto), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            catch { }
        }

        return ServiceResult<RealLeadAnalyticsDto>.Ok(resultDto);
    }

    public async Task<ServiceResult<List<PaymentTransactionDto>>> GetBillingHistoryAsync(Guid landlordId)
    {
        var transactions = await _db.PaymentTransactions
            .Where(t => t.UserId == landlordId)
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

        return ServiceResult<List<PaymentTransactionDto>>.Ok(transactions);
    }

    public async Task<ServiceResult<object>> CheckoutSubscriptionAsync(Guid landlordId, CheckoutDto dto, string clientIp)
    {
        var user = await _db.Users.FindAsync(landlordId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<object>.Fail("Bạn cần là Chủ trọ để đăng ký gói dịch vụ.", 400);
        }

        decimal price = dto.PlanName.Equals("Enterprise", StringComparison.OrdinalIgnoreCase) ? 499000m : 199000m;

        var newSubscription = new LandlordSubscription
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            PlanName = dto.PlanName,
            Price = price,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = false
        };

        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            UserId = landlordId,
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

        var vnpParams = new SortedDictionary<string, string>
        {
            { "vnp_Amount", ((long)(price * 100)).ToString() },
            { "vnp_Command", "pay" },
            { "vnp_CreateDate", DateTime.UtcNow.ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_IpAddr", string.IsNullOrWhiteSpace(clientIp) ? "127.0.0.1" : clientIp },
            { "vnp_Locale", "vn" },
            { "vnp_OrderInfo", $"Thanh toan goi {dto.PlanName} Dormi" },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", "http://localhost:5173/landlord/billing" },
            { "vnp_TmnCode", "DORMI01" },
            { "vnp_TxnRef", transaction.TransactionRef },
            { "vnp_Version", "2.1.0" }
        };

        var signData = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var secureHash = ComputeHmacSha512(GetVnpaySecret(), signData);
        var paymentUrl = $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?{signData}&vnp_SecureHash={secureHash}";
        var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={Uri.EscapeDataString(paymentUrl)}";

        return ServiceResult<object>.Ok(new
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

    public async Task<ServiceResult<object>> GetPaymentStatusAsync(Guid landlordId, string transactionRef)
    {
        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == transactionRef && t.UserId == landlordId);

        if (transaction == null) return ServiceResult<object>.NotFound("Không tìm thấy giao dịch.");

        return ServiceResult<object>.Ok(new
        {
            transactionRef = transaction.TransactionRef,
            status = transaction.Status,
            amount = transaction.Amount,
            planName = transaction.Subscription?.PlanName,
            completedAt = transaction.CompletedAt
        });
    }

    public async Task<ServiceResult<object>> SimulateGatewayPaymentAsync(Guid landlordId, PaymentVerifyDto dto)
    {
        if (!_env.IsDevelopment())
        {
            return ServiceResult<object>.Fail("Chức năng mô phỏng thanh toán bị vô hiệu hóa trên môi trường Production.", 403);
        }

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == dto.TransactionRef && t.UserId == landlordId);

        if (transaction == null) return ServiceResult<object>.NotFound("Không tìm thấy giao dịch thanh toán.");

        if (transaction.Status == "Completed")
        {
            return ServiceResult<object>.Ok(new { message = "Giao dịch này đã được hoàn tất trước đó.", status = "Completed" });
        }

        transaction.Status = "Completed";
        transaction.CompletedAt = DateTime.UtcNow;

        if (transaction.Subscription != null)
        {
            var olderSubs = await _db.LandlordSubscriptions
                .Where(s => s.LandlordId == landlordId && s.Id != transaction.Subscription.Id && s.IsActive)
                .ToListAsync();
            foreach (var old in olderSubs) old.IsActive = false;

            transaction.Subscription.IsActive = true;
        }

        if (transaction.RoomId.HasValue)
        {
            var room = await _db.Rooms.FindAsync(transaction.RoomId.Value);
            if (room != null)
            {
                var durationDays = transaction.Description.Contains("7days") ? 7 : (transaction.Description.Contains("3days") ? 3 : 1);
                var boostType = transaction.Description.Contains("7days") ? "7days" : (transaction.Description.Contains("3days") ? "3days" : "24h");
                room.IsBoosted = true;
                room.BoostType = boostType;
                room.BoostExpiresAt = DateTime.UtcNow.AddDays(durationDays);
            }
        }

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = landlordId,
            Title = "Thanh toán thành công",
            Message = $"Giao dịch {transaction.TransactionRef} ({transaction.Amount:N0}đ) đã hoàn tất. {transaction.Description} đã được kích hoạt.",
            Type = "System",
            LinkUrl = transaction.RoomId.HasValue ? "/landlord/rooms" : "/landlord/billing",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Xác nhận thanh toán thành công! Dịch vụ của bạn đã được kích hoạt.", status = "Completed" });
    }

    public async Task<ServiceResult<object>> VerifyPaymentAsync(Guid landlordId, PaymentVerifyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TransactionRef))
        {
            return ServiceResult<object>.Fail("Mã tham chiếu giao dịch không hợp lệ.", 400);
        }

        if (string.IsNullOrWhiteSpace(dto.SecureHash))
        {
            return ServiceResult<object>.Fail("Yêu cầu chữ ký bảo mật xác thực giao dịch (SecureHash).", 400);
        }

        var secret = GetVnpaySecret();
        var expectedHash = ComputeHmacSha512(secret, $"vnp_ResponseCode={dto.ResponseCode ?? "00"}&vnp_TxnRef={dto.TransactionRef}");
        if (!string.Equals(expectedHash, dto.SecureHash, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<object>.Fail("Chữ ký xác thực thanh toán không hợp lệ (HMAC signature mismatch).", 400);
        }

        if (dto.ResponseCode != "00")
        {
            return ServiceResult<object>.Fail($"Giao dịch thanh toán chưa hoàn tất thành công từ cổng đối tác (Mã phản hồi: {dto.ResponseCode}).", 400);
        }

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == dto.TransactionRef && t.UserId == landlordId);

        if (transaction == null) return ServiceResult<object>.NotFound("Không tìm thấy giao dịch thanh toán.");

        if (transaction.Status == "Completed")
        {
            return ServiceResult<object>.Ok(new { message = "Giao dịch này đã được xác nhận thanh toán trước đó.", transactionId = transaction.Id, status = "Completed" });
        }

        transaction.Status = "Completed";
        transaction.CompletedAt = DateTime.UtcNow;

        if (transaction.Subscription != null)
        {
            var olderSubs = await _db.LandlordSubscriptions
                .Where(s => s.LandlordId == landlordId && s.Id != transaction.Subscription.Id && s.IsActive)
                .ToListAsync();
            foreach (var old in olderSubs) old.IsActive = false;

            transaction.Subscription.IsActive = true;
        }

        if (transaction.RoomId.HasValue)
        {
            var room = await _db.Rooms.FindAsync(transaction.RoomId.Value);
            if (room != null)
            {
                var durationDays = transaction.Description.Contains("7days") ? 7 : (transaction.Description.Contains("3days") ? 3 : 1);
                var boostType = transaction.Description.Contains("7days") ? "7days" : (transaction.Description.Contains("3days") ? "3days" : "24h");
                room.IsBoosted = true;
                room.BoostType = boostType;
                room.BoostExpiresAt = DateTime.UtcNow.AddDays(durationDays);
            }
        }

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = landlordId,
            Title = "Thanh toán thành công",
            Message = $"Giao dịch {transaction.TransactionRef} ({transaction.Amount:N0}đ) đã hoàn tất. {transaction.Description} đã được kích hoạt.",
            Type = "System",
            LinkUrl = transaction.RoomId.HasValue ? "/landlord/rooms" : "/landlord/billing",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Xác nhận thanh toán thành công! Dịch vụ của bạn đã được kích hoạt.", status = "Completed" });
    }

    public async Task<ServiceResult<string>> ProcessVnpayReturnAsync(IDictionary<string, string> queryParams, string vnp_TxnRef, string vnp_ResponseCode, string vnp_SecureHash)
    {
        var signData = string.Join("&", queryParams.OrderBy(kvp => kvp.Key).Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var computedHash = ComputeHmacSha512(GetVnpaySecret(), signData);

        if (!string.Equals(computedHash, vnp_SecureHash, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<string>.Fail("Chữ ký checksum không hợp lệ.", 400);
        }

        var transaction = await _db.PaymentTransactions
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.TransactionRef == vnp_TxnRef);

        if (transaction == null) return ServiceResult<string>.NotFound("Không tìm thấy giao dịch.");

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
            return ServiceResult<string>.Ok("http://localhost:5173/landlord/billing?payment=success");
        }
        else
        {
            transaction.Status = "Failed";
            await _db.SaveChangesAsync();
            return ServiceResult<string>.Ok("http://localhost:5173/landlord/billing?payment=failed");
        }
    }

    public async Task<ServiceResult<List<TenantDiscoveryDto>>> DiscoverTenantsAsync(Guid landlordId)
    {
        var landlordRooms = await _db.Rooms
            .Where(r => r.LandlordId == landlordId)
            .Select(r => new { r.Address, r.Price })
            .ToListAsync();

        var landlordDistricts = landlordRooms
            .Select(r => r.Address.ToLower())
            .ToList();
        var avgPrice = landlordRooms.Count > 0 ? (double)landlordRooms.Average(r => r.Price) : 3500000.0;

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
            double repScore = c.IsVerified ? 90.0 : 65.0;
            if (reviewsByTenant.TryGetValue(c.Id, out var avgRating))
            {
                repScore = Math.Min(100.0, avgRating * 20.0);
            }

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

            string lsLower = (c.Lifestyle ?? string.Empty).ToLower();
            string[] positiveTraits = new[] { "sạch sẽ", "gọn gàng", "yên tĩnh", "không hút thuốc", "đi làm", "lịch sự" };
            int matchCount = positiveTraits.Count(t => lsLower.Contains(t));
            double lifestyleScore = Math.Clamp(65.0 + matchCount * 7.0, 65.0, 98.0);

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
                BudgetRange = avgPrice <= 3500000 ? "2.5 - 3.5 triệu/tháng" : (avgPrice <= 5500000 ? "3.5 - 5.5 triệu/tháng" : "5.5 - 8.0 triệu/tháng"),
                IsVerified = c.IsVerified,
                ReputationRating = reviewsByTenant.TryGetValue(c.Id, out var rRating) ? Math.Round(rRating, 1) : (c.IsVerified ? 4.8 : 4.0),
                PreferredLocation = !string.IsNullOrWhiteSpace(c.Preferences) && c.Preferences.Contains("Quận") ? c.Preferences : "TP. Hồ Chí Minh"
            };
        }).OrderByDescending(t => t.MatchScore).ToList();

        return ServiceResult<List<TenantDiscoveryDto>>.Ok(result);
    }

    public async Task<ServiceResult<object>> InviteTenantToRoomAsync(Guid landlordId, InviteTenantDto dto)
    {
        var landlord = await _db.Users.FindAsync(landlordId);
        if (landlord == null) return ServiceResult<object>.Unauthorized();

        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == dto.RoomId && r.LandlordId == landlordId);
        if (room == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ hoặc bạn không có quyền quản lý phòng này.");
        }

        var tenant = await _db.Users.FindAsync(dto.TenantId);
        if (tenant == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy thông tin khách thuê.");
        }

        // Add notification
        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = dto.TenantId,
            Title = "Lời mời xem phòng từ Chủ trọ",
            Message = $"Chủ trọ {landlord.FullName} mời bạn tham khảo căn phòng '{room.Title}' ({room.Address}). Giá thuê: {room.Price:N0}đ/tháng.",
            Type = "System",
            LinkUrl = $"/room/{room.Id}",
            CreatedAt = DateTime.UtcNow
        });

        // Add message in chat
        var customNote = string.IsNullOrWhiteSpace(dto.Message)
            ? "Mình thấy tiêu chí tìm phòng của bạn rất phù hợp với căn phòng này. Bạn có thể xem chi tiết và liên hệ hẹn lịch xem phòng nhé!"
            : dto.Message.Trim();

        var messageContent = $"[Lời mời thuê phòng] Chào {tenant.FullName}, mình là chủ phòng '{room.Title}'. Mình gửi bạn thông tin căn phòng tại {room.Address} (Giá thuê: {room.Price:N0}đ/tháng). Chi tiết phòng: /room/{room.Id}\n\nLời nhắn: {customNote}";

        _db.Messages.Add(new Message
        {
            Id = Guid.NewGuid(),
            SenderId = landlordId,
            ReceiverId = dto.TenantId,
            Content = messageContent,
            IsRead = false,
            SentAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Đã gửi lời mời thuê phòng đến khách thuê thành công!", roomId = room.Id, tenantId = dto.TenantId });
    }

    public async Task<ServiceResult<object>> BoostRoomAsync(Guid landlordId, Guid roomId, BoostRoomDto dto, string clientIp)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == roomId && r.LandlordId == landlordId);
        if (room == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ hoặc bạn không có quyền quản lý phòng này.");
        }

        decimal price = dto.BoostType switch
        {
            "24h" => 50000m,
            "3days" => 120000m,
            "7days" => 250000m,
            _ => 50000m
        };

        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            UserId = landlordId,
            RoomId = roomId,
            Amount = price,
            PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "VNPay" : dto.PaymentMethod,
            TransactionRef = $"BOOST-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
            Description = $"Đẩy tin nổi bật ({dto.BoostType}) phòng '{room.Title}'",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.PaymentTransactions.Add(transaction);
        await _db.SaveChangesAsync();

        var vnpParams = new SortedDictionary<string, string>
        {
            { "vnp_Amount", ((long)(price * 100)).ToString() },
            { "vnp_Command", "pay" },
            { "vnp_CreateDate", DateTime.UtcNow.ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_IpAddr", string.IsNullOrWhiteSpace(clientIp) ? "127.0.0.1" : clientIp },
            { "vnp_Locale", "vn" },
            { "vnp_OrderInfo", $"Thanh toan day tin {dto.BoostType} phong {room.Title}" },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", "http://localhost:5173/landlord/billing" },
            { "vnp_TmnCode", "DORMI01" },
            { "vnp_TxnRef", transaction.TransactionRef },
            { "vnp_Version", "2.1.0" }
        };

        var signData = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var secureHash = ComputeHmacSha512(GetVnpaySecret(), signData);
        var paymentUrl = $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?{signData}&vnp_SecureHash={secureHash}";
        var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={Uri.EscapeDataString(paymentUrl)}";

        return ServiceResult<object>.Ok(new
        {
            roomId = room.Id,
            roomTitle = room.Title,
            boostType = dto.BoostType,
            transactionRef = transaction.TransactionRef,
            amount = transaction.Amount,
            paymentMethod = transaction.PaymentMethod,
            status = "PendingPayment",
            paymentUrl = paymentUrl,
            qrUrl = qrUrl,
            message = $"Khởi tạo thanh toán đẩy tin nổi bật ({dto.BoostType}) thành công. Vui lòng quét mã để kích hoạt."
        });
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
