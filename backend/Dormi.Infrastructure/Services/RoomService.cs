using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;
using NetTopologySuite.Geometries;

namespace Dormi.Infrastructure.Services;

public class RoomService : IRoomService
{
    private readonly DormiDbContext _db;
    private readonly IImageService _imageService;
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly IDistributedCache _cache;
    private readonly IMemoryCache _memoryCache;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IKafkaProducer? _kafkaProducer;
    private static readonly JsonSerializerOptions _cacheJsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    // ponytail: bounded channel batches RoomView DB writes to eliminate lock contention on GET /api/rooms/{id}
    private static readonly Channel<RoomView> _viewChannel = Channel.CreateBounded<RoomView>(new BoundedChannelOptions(10000)
    {
        FullMode = BoundedChannelFullMode.DropOldest
    });
    private static int _processorStarted = 0;
    private static IServiceScopeFactory? _staticScopeFactory;

    public RoomService(
        DormiDbContext db, 
        IImageService imageService, 
        IHubContext<ChatHub> hubContext,
        IDistributedCache cache,
        IMemoryCache memoryCache,
        IServiceScopeFactory scopeFactory,
        IKafkaProducer? kafkaProducer = null)
    {
        _db = db;
        _imageService = imageService;
        _hubContext = hubContext;
        _cache = cache;
        _memoryCache = memoryCache;
        _scopeFactory = scopeFactory;
        _kafkaProducer = kafkaProducer;

        EnsureViewProcessorStarted(scopeFactory);
    }

    private static void EnsureViewProcessorStarted(IServiceScopeFactory scopeFactory)
    {
        _staticScopeFactory = scopeFactory;
        if (Interlocked.CompareExchange(ref _processorStarted, 1, 0) == 0)
        {
            Task.Run(async () =>
            {
                var reader = _viewChannel.Reader;
                var batch = new List<RoomView>(50);
                while (await reader.WaitToReadAsync())
                {
                    batch.Clear();
                    while (batch.Count < 50 && reader.TryRead(out var item))
                    {
                        batch.Add(item);
                    }

                    if (batch.Count > 0 && _staticScopeFactory != null)
                    {
                        try
                        {
                            using var scope = _staticScopeFactory.CreateScope();
                            var db = scope.ServiceProvider.GetRequiredService<DormiDbContext>();
                            db.RoomViews.AddRange(batch);
                            await db.SaveChangesAsync();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[View Batch Error]: {ex.Message}");
                        }
                        await Task.Delay(200);
                    }
                }
            });
        }
    }

    private static bool IsValidImageFile(IFormFile file, out string? errorMessage)
    {
        if (file == null || file.Length == 0)
        {
            errorMessage = "Vui lòng chọn tập tin ảnh hợp lệ.";
            return false;
        }

        if (file.Length > 20 * 1024 * 1024)
        {
            errorMessage = "Dung lượng ảnh vượt quá giới hạn tối đa 20MB.";
            return false;
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".jfif", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif", ".heic", ".heif", ".ico", ".tiff", ".tif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext))
        {
            errorMessage = "Định dạng tập tin không được hỗ trợ. Chấp nhận các định dạng: JPG, PNG, WEBP, GIF, SVG, AVIF, HEIC, BMP, ICO, TIFF.";
            return false;
        }

        if (!ValidateImageSignature(file, ext))
        {
            errorMessage = "Nội dung tập tin không khớp với định dạng ảnh hợp lệ hoặc tập tin bị lỗi.";
            return false;
        }

        errorMessage = null;
        return true;
    }

    private static bool ValidateImageSignature(IFormFile file, string ext)
    {
        try
        {
            if (file.ContentType?.StartsWith("image/") == true && (ext == ".svg" || ext == ".ico"))
            {
                return true;
            }

            using var stream = file.OpenReadStream();
            if (stream.Length < 4) return false;
            var header = new byte[Math.Min(stream.Length, 128)];
            var bytesRead = stream.Read(header, 0, header.Length);
            if (bytesRead < 4) return false;

            return ext switch
            {
                ".jpg" or ".jpeg" or ".jfif" => header[0] == 0xFF && header[1] == 0xD8,
                ".png" => header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47,
                ".gif" => header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38,
                ".bmp" => header[0] == 0x42 && header[1] == 0x4D,
                ".webp" => bytesRead >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                           header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50,
                ".heic" or ".heif" => bytesRead >= 12 && header[4] == 0x66 && header[5] == 0x74 && header[6] == 0x79 && header[7] == 0x70,
                ".avif" => bytesRead >= 12 && (
                    (header[4] == 0x66 && header[5] == 0x74 && header[6] == 0x79 && header[7] == 0x70) ||
                    System.Text.Encoding.ASCII.GetString(header, 0, bytesRead).Contains("avif")),
                ".svg" => (file.ContentType?.Contains("svg") == true) || 
                          System.Text.Encoding.UTF8.GetString(header, 0, bytesRead).Contains("<svg") ||
                          System.Text.Encoding.UTF8.GetString(header, 0, bytesRead).Contains("<?xml"),
                ".ico" => header[0] == 0x00 && header[1] == 0x00 && (header[2] == 0x01 || header[2] == 0x02) && header[3] == 0x00,
                ".tiff" or ".tif" => (header[0] == 0x49 && header[1] == 0x49 && header[2] == 0x2A && header[3] == 0x00) ||
                                     (header[0] == 0x4D && header[1] == 0x4D && header[2] == 0x00 && header[3] == 0x2A),
                _ => file.ContentType?.StartsWith("image/") == true
            };
        }
        catch
        {
            return file.ContentType?.StartsWith("image/") == true;
        }
    }

    public async Task<ServiceResult<object>> GetRoomsAsync(RoomQueryFilterDto filter, Guid? currentUserId, bool isAdmin, bool isLandlord)
    {
        string? cacheKey = null;
        var isPublicQuery = !isAdmin && (!isLandlord || filter.LandlordOnly != true || !currentUserId.HasValue);
        string? l1Key = null;
        if (isPublicQuery)
        {
            var version = "1";
            try { version = await _cache.GetStringAsync("rooms_cache_version") ?? "1"; } catch { }
            l1Key = $"rooms_search_l1:{version}:{filter.LandlordId}:{filter.Query}:{filter.RoomType}:{filter.MinPrice}:{filter.MaxPrice}:{filter.District}:{filter.SortBy}:{filter.Page}:{filter.PageSize}";
            if (_memoryCache.TryGetValue(l1Key, out object? l1Cached) && l1Cached != null)
            {
                return ServiceResult<object>.Ok(l1Cached);
            }

            try
            {
                cacheKey = $"rooms_search:{version}:{filter.LandlordId}:{filter.Query}:{filter.RoomType}:{filter.MinPrice}:{filter.MaxPrice}:{filter.District}:{filter.SortBy}:{filter.Page}:{filter.PageSize}";
                var cached = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cached))
                {
                    var cachedObj = JsonSerializer.Deserialize<JsonElement>(cached);
                    _memoryCache.Set(l1Key, cachedObj, TimeSpan.FromSeconds(60));
                    return ServiceResult<object>.Ok(cachedObj);
                }
            }
            catch { }
        }
        else if (isLandlord && currentUserId.HasValue && currentUserId.Value != Guid.Empty && string.IsNullOrWhiteSpace(filter.Query))
        {
            l1Key = $"landlord_rooms_l1:{currentUserId.Value}:{filter.Status}:{filter.SortBy}:{filter.Page}:{filter.PageSize}";
            if (_memoryCache.TryGetValue(l1Key, out object? l1Cached) && l1Cached != null)
            {
                return ServiceResult<object>.Ok(l1Cached);
            }

            try
            {
                cacheKey = $"landlord_rooms:{currentUserId.Value}:{filter.Status}:{filter.SortBy}:{filter.Page}:{filter.PageSize}";
                var cached = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cached))
                {
                    var cachedObj = JsonSerializer.Deserialize<JsonElement>(cached);
                    _memoryCache.Set(l1Key, cachedObj, TimeSpan.FromSeconds(60));
                    return ServiceResult<object>.Ok(cachedObj);
                }
            }
            catch { }
        }

        var query = _db.Rooms
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var rawSearch = filter.Query.Trim().ToLower();

            var isTanBinh = rawSearch.Contains("tan binh") || rawSearch.Contains("tân bình");
            var isThuDuc = rawSearch.Contains("thu duc") || rawSearch.Contains("thủ đức");
            var isBinhThanh = rawSearch.Contains("binh thanh") || rawSearch.Contains("bình thạnh");
            var isQ10 = rawSearch.Contains("quan 10") || rawSearch.Contains("quận 10") || rawSearch.Contains("q10") || rawSearch.Contains("q.10");
            var isQ1 = rawSearch.Contains("quan 1") || rawSearch.Contains("quận 1") || rawSearch.Contains("q1") || rawSearch.Contains("q.1");
            var isQ3 = rawSearch.Contains("quan 3") || rawSearch.Contains("quận 3") || rawSearch.Contains("q3") || rawSearch.Contains("q.3");
            var isQ7 = rawSearch.Contains("quan 7") || rawSearch.Contains("quận 7") || rawSearch.Contains("q7") || rawSearch.Contains("q.7");
            var isFPT = rawSearch.Contains("fpt") || rawSearch.Contains("đại học fpt") || rawSearch.Contains("dai hoc fpt");
            var isUEH = rawSearch.Contains("ueh") || rawSearch.Contains("kinh tế") || rawSearch.Contains("kinh te");
            var isBK = rawSearch.Contains("bách khoa") || rawSearch.Contains("bach khoa");
            var isGacLung = rawSearch.Contains("gác") || rawSearch.Contains("gac");

            query = query.Where(r => 
                r.Title.ToLower().Contains(rawSearch) || 
                r.Address.ToLower().Contains(rawSearch) ||
                r.Description.ToLower().Contains(rawSearch) ||
                (isTanBinh && r.Address.ToLower().Contains("tân bình")) ||
                (isThuDuc && (r.Address.ToLower().Contains("thủ đức") || r.Address.ToLower().Contains("quận 9"))) ||
                (isBinhThanh && r.Address.ToLower().Contains("bình thạnh")) ||
                (isQ10 && (r.Address.ToLower().Contains("quận 10") || r.Address.ToLower().Contains("q.10") || r.Address.ToLower().Contains("q10") || r.Title.ToLower().Contains("quận 10") || r.Title.ToLower().Contains("q.10"))) ||
                (isQ1 && (r.Address.ToLower().Contains("quận 1") || r.Address.ToLower().Contains("q.1") || r.Address.ToLower().Contains("q1") || r.Title.ToLower().Contains("quận 1") || r.Title.ToLower().Contains("q.1"))) ||
                (isQ3 && (r.Address.ToLower().Contains("quận 3") || r.Address.ToLower().Contains("q.3") || r.Address.ToLower().Contains("q3") || r.Title.ToLower().Contains("quận 3") || r.Title.ToLower().Contains("q.3"))) ||
                (isQ7 && (r.Address.ToLower().Contains("quận 7") || r.Address.ToLower().Contains("q.7") || r.Address.ToLower().Contains("q7") || r.Title.ToLower().Contains("quận 7") || r.Title.ToLower().Contains("q.7"))) ||
                (isFPT && (r.Address.ToLower().Contains("thủ đức") || r.Address.ToLower().Contains("quận 9") || r.Title.ToLower().Contains("fpt") || r.Description.ToLower().Contains("fpt"))) ||
                (isUEH && (r.Address.ToLower().Contains("quận 10") || r.Address.ToLower().Contains("quận 3") || r.Address.ToLower().Contains("quận 1") || r.Description.ToLower().Contains("ueh") || r.Title.ToLower().Contains("ueh"))) ||
                (isBK && (r.Address.ToLower().Contains("quận 10") || r.Address.ToLower().Contains("thủ đức") || r.Description.ToLower().Contains("bách khoa"))) ||
                (isGacLung && (r.Title.ToLower().Contains("gác") || r.Description.ToLower().Contains("gác")))
            );
        }

        if (!string.IsNullOrWhiteSpace(filter.RoomType))
        {
            query = query.Where(r => r.RoomType.ToLower() == filter.RoomType.Trim().ToLower());
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(r => r.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(r => r.Price <= filter.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.District))
        {
            var rawDistrict = filter.District.Trim().ToLower();
            var isQ1 = rawDistrict.Contains("quận 1") || rawDistrict.Contains("quan 1") || rawDistrict == "q1" || rawDistrict == "q.1";
            var isQ2 = rawDistrict.Contains("quận 2") || rawDistrict.Contains("quan 2") || rawDistrict == "q2" || rawDistrict == "q.2";
            var isQ3 = rawDistrict.Contains("quận 3") || rawDistrict.Contains("quan 3") || rawDistrict == "q3" || rawDistrict == "q.3";
            var isQ4 = rawDistrict.Contains("quận 4") || rawDistrict.Contains("quan 4") || rawDistrict == "q4" || rawDistrict == "q.4";
            var isQ5 = rawDistrict.Contains("quận 5") || rawDistrict.Contains("quan 5") || rawDistrict == "q5" || rawDistrict == "q.5";
            var isQ6 = rawDistrict.Contains("quận 6") || rawDistrict.Contains("quan 6") || rawDistrict == "q6" || rawDistrict == "q.6";
            var isQ7 = rawDistrict.Contains("quận 7") || rawDistrict.Contains("quan 7") || rawDistrict == "q7" || rawDistrict == "q.7";
            var isQ8 = rawDistrict.Contains("quận 8") || rawDistrict.Contains("quan 8") || rawDistrict == "q8" || rawDistrict == "q.8";
            var isQ9 = rawDistrict.Contains("quận 9") || rawDistrict.Contains("quan 9") || rawDistrict == "q9" || rawDistrict == "q.9";
            var isQ10 = rawDistrict.Contains("quận 10") || rawDistrict.Contains("quan 10") || rawDistrict == "q10" || rawDistrict == "q.10";
            var isQ11 = rawDistrict.Contains("quận 11") || rawDistrict.Contains("quan 11") || rawDistrict == "q11" || rawDistrict == "q.11";
            var isQ12 = rawDistrict.Contains("quận 12") || rawDistrict.Contains("quan 12") || rawDistrict == "q12" || rawDistrict == "q.12";
            var isBinhThanh = rawDistrict.Contains("bình thạnh") || rawDistrict.Contains("binh thanh");
            var isTanBinh = rawDistrict.Contains("tân bình") || rawDistrict.Contains("tan binh");
            var isTanPhu = rawDistrict.Contains("tân phú") || rawDistrict.Contains("tan phu");
            var isGoVap = rawDistrict.Contains("gò vấp") || rawDistrict.Contains("go vap");
            var isPhuNhuan = rawDistrict.Contains("phú nhuận") || rawDistrict.Contains("phu nhuan");
            var isThuDuc = rawDistrict.Contains("thủ đức") || rawDistrict.Contains("thu duc");

            query = query.Where(r =>
                r.Address.ToLower().Contains(rawDistrict) ||
                r.Title.ToLower().Contains(rawDistrict) ||
                (isQ1 && (r.Address.ToLower().Contains("quận 1") || r.Address.ToLower().Contains("q.1") || r.Address.ToLower().Contains("q1") || r.Title.ToLower().Contains("quận 1") || r.Title.ToLower().Contains("q.1"))) ||
                (isQ2 && (r.Address.ToLower().Contains("quận 2") || r.Address.ToLower().Contains("q.2") || r.Address.ToLower().Contains("q2") || r.Title.ToLower().Contains("quận 2"))) ||
                (isQ3 && (r.Address.ToLower().Contains("quận 3") || r.Address.ToLower().Contains("q.3") || r.Address.ToLower().Contains("q3") || r.Title.ToLower().Contains("quận 3") || r.Title.ToLower().Contains("q.3"))) ||
                (isQ4 && (r.Address.ToLower().Contains("quận 4") || r.Address.ToLower().Contains("q.4") || r.Address.ToLower().Contains("q4") || r.Title.ToLower().Contains("quận 4"))) ||
                (isQ5 && (r.Address.ToLower().Contains("quận 5") || r.Address.ToLower().Contains("q.5") || r.Address.ToLower().Contains("q5") || r.Title.ToLower().Contains("quận 5"))) ||
                (isQ6 && (r.Address.ToLower().Contains("quận 6") || r.Address.ToLower().Contains("q.6") || r.Address.ToLower().Contains("q6") || r.Title.ToLower().Contains("quận 6"))) ||
                (isQ7 && (r.Address.ToLower().Contains("quận 7") || r.Address.ToLower().Contains("q.7") || r.Address.ToLower().Contains("q7") || r.Title.ToLower().Contains("quận 7") || r.Title.ToLower().Contains("q.7"))) ||
                (isQ8 && (r.Address.ToLower().Contains("quận 8") || r.Address.ToLower().Contains("q.8") || r.Address.ToLower().Contains("q8") || r.Title.ToLower().Contains("quận 8"))) ||
                (isQ9 && (r.Address.ToLower().Contains("quận 9") || r.Address.ToLower().Contains("q.9") || r.Address.ToLower().Contains("q9") || r.Title.ToLower().Contains("quận 9"))) ||
                (isQ10 && (r.Address.ToLower().Contains("quận 10") || r.Address.ToLower().Contains("q.10") || r.Address.ToLower().Contains("q10") || r.Title.ToLower().Contains("quận 10") || r.Title.ToLower().Contains("q.10"))) ||
                (isQ11 && (r.Address.ToLower().Contains("quận 11") || r.Address.ToLower().Contains("q.11") || r.Address.ToLower().Contains("q11") || r.Title.ToLower().Contains("quận 11"))) ||
                (isQ12 && (r.Address.ToLower().Contains("quận 12") || r.Address.ToLower().Contains("q.12") || r.Address.ToLower().Contains("q12") || r.Title.ToLower().Contains("quận 12"))) ||
                (isBinhThanh && (r.Address.ToLower().Contains("bình thạnh") || r.Title.ToLower().Contains("bình thạnh"))) ||
                (isTanBinh && (r.Address.ToLower().Contains("tân bình") || r.Title.ToLower().Contains("tân bình"))) ||
                (isTanPhu && (r.Address.ToLower().Contains("tân phú") || r.Title.ToLower().Contains("tân phú"))) ||
                (isGoVap && (r.Address.ToLower().Contains("gò vấp") || r.Title.ToLower().Contains("gò vấp"))) ||
                (isPhuNhuan && (r.Address.ToLower().Contains("phú nhuận") || r.Title.ToLower().Contains("phú nhuận"))) ||
                (isThuDuc && (r.Address.ToLower().Contains("thủ đức") || r.Address.ToLower().Contains("quận 9") || r.Address.ToLower().Contains("quận 2") || r.Title.ToLower().Contains("thủ đức")))
            );
        }

        Point? userPoint = null;
        if (filter.Latitude.HasValue && filter.Longitude.HasValue)
        {
            userPoint = new Point(filter.Longitude.Value, filter.Latitude.Value) { SRID = 4326 };
            if (filter.RadiusKm.HasValue && filter.RadiusKm.Value > 0)
            {
                double distanceMeters = filter.RadiusKm.Value * 1000.0;
                query = query.Where(r => r.Location != null && r.Location.IsWithinDistance(userPoint, distanceMeters));
            }
        }

        if (filter.LandlordId.HasValue)
        {
            query = query.Where(r => r.LandlordId == filter.LandlordId.Value);
        }

        if (isAdmin)
        {
            if (filter.Status.HasValue)
            {
                query = query.Where(r => r.Status == filter.Status.Value);
            }
        }
        else if (isLandlord && currentUserId.HasValue && currentUserId.Value != Guid.Empty && (filter.LandlordOnly == true || (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))))
        {
            if (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))
            {
                query = query.Where(r => r.LandlordId == currentUserId.Value && r.Status == filter.Status.Value);
            }
            else if (filter.Status.HasValue)
            {
                query = query.Where(r => r.LandlordId == currentUserId.Value && r.Status == filter.Status.Value);
            }
            else
            {
                query = query.Where(r => r.LandlordId == currentUserId.Value);
            }
        }
        else
        {
            if (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))
            {
                return ServiceResult<object>.Forbidden("Bạn không có quyền truy cập danh sách phòng ở trạng thái này.");
            }

            var currentTime = DateTime.UtcNow;
            // Chỉ hiển thị phòng đang còn trống (Available) và không có hợp đồng thuê nào đang hoạt động hoặc chờ ký
            query = query.Where(r => r.Status == RoomStatus.Available && !_db.LeaseContracts.Any(l => l.RoomId == r.Id && 
                (l.Status == "Active" || l.Status == "Signed" || l.Status == "PendingSignature" || 
                 (l.StartDate <= currentTime && l.EndDate >= currentTime && l.Status != "Terminated" && l.Status != "Expired" && l.Status != "Cancelled"))));
        }

        var totalItems = await query.CountAsync();
        var page = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;

        var now = DateTime.UtcNow;
        query = filter.SortBy switch
        {
            "price-asc" or "price-low" => query.OrderBy(r => r.Price),
            "price-desc" or "price-high" => query.OrderByDescending(r => r.Price),
            "oldest" => query.OrderBy(r => r.CreatedAt),
            "area-desc" => query.OrderByDescending(r => r.Area),
            "area-asc" => query.OrderBy(r => r.Area),
            "trust-score" or "trust" or "trustScore_desc" => query.OrderByDescending(r => r.IsPropertyVerified).ThenByDescending(r => r.Landlord.IsVerified).ThenByDescending(r => r.CreatedAt),
            "verified" => query.OrderByDescending(r => r.Landlord.IsVerified).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.IsBoosted && r.BoostExpiresAt > now).ThenByDescending(r => r.CreatedAt)
        };

        var rooms = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RoomResponseDto
            {
                Id = r.Id,
                LandlordId = r.LandlordId,
                LandlordName = r.Landlord.FullName,
                LandlordPhone = r.Landlord.PhoneNumber,
                Title = r.Title,
                Description = r.Description,
                Price = r.Price,
                Area = r.Area,
                Utilities = r.Utilities,
                RoomType = r.RoomType,
                Address = r.Address,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                DistanceKm = (userPoint != null && r.Location != null) ? Math.Round(r.Location.Distance(userPoint) / 1000.0, 2) : null,
                Virtual3DUrl = r.Virtual3DUrl,
                Status = (_db.LeaseContracts.Any(l => l.RoomId == r.Id && 
                            (l.Status == "Active" || l.Status == "Signed" || l.Status == "PendingSignature" || 
                             (l.StartDate <= now && l.EndDate >= now && l.Status != "Terminated" && l.Status != "Expired" && l.Status != "Cancelled"))) 
                          && r.Status != RoomStatus.Hidden && r.Status != RoomStatus.PendingApproval)
                    ? RoomStatus.Rented
                    : r.Status,
                IsVerifiedLandlord = r.Landlord.IsVerified,
                CreatedAt = r.CreatedAt,
                IsBoosted = r.IsBoosted && r.BoostExpiresAt > now,
                BoostExpiresAt = r.BoostExpiresAt,
                BoostType = r.BoostType,
                Images = r.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        var responsePayload = new
        {
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
            Data = rooms
        };

        if (cacheKey != null)
        {
            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(responsePayload, _cacheJsonOptions), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60)
                });
            }
            catch { }
        }

        if (l1Key != null)
        {
            _memoryCache.Set(l1Key, responsePayload, TimeSpan.FromSeconds(60));
        }

        return ServiceResult<object>.Ok(responsePayload);
    }

    private async Task InvalidateRoomsCacheAsync(Guid? roomId = null)
    {
        try
        {
            await _cache.SetStringAsync("rooms_cache_version", Guid.NewGuid().ToString("N"), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            });
            await _cache.RemoveAsync("featured_rooms_6");
            await _cache.RemoveAsync("featured_rooms_8");
            await _cache.RemoveAsync("featured_rooms_10");
            await _cache.RemoveAsync("featured_rooms_12");
            if (roomId.HasValue)
            {
                _memoryCache.Remove($"room:detail:{roomId.Value}");
                _memoryCache.Remove($"room_detail:{roomId.Value}");
                await _cache.RemoveAsync($"room:detail:{roomId.Value}");
                await _cache.RemoveAsync($"room_detail:{roomId.Value}");
            }
        }
        catch { }
    }

    private Task InvalidateFeaturedRoomsCacheAsync() => InvalidateRoomsCacheAsync(null);

    public async Task<ServiceResult<List<RoomResponseDto>>> GetFeaturedRoomsAsync(int limit = 6)
    {
        var cacheKey = $"featured_rooms_{limit}";
        var cached = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cached))
        {
            try
            {
                var cachedList = JsonSerializer.Deserialize<List<RoomResponseDto>>(cached);
                if (cachedList != null)
                {
                    return ServiceResult<List<RoomResponseDto>>.Ok(cachedList);
                }
            }
            catch
            {
                // Fallback to database query if deserialization fails
            }
        }

        var now = DateTime.UtcNow;
        var featured = await _db.Rooms
            .AsNoTracking()
            .Where(r => r.Status == RoomStatus.Available && !_db.LeaseContracts.Any(l => l.RoomId == r.Id && 
                (l.Status == "Active" || l.Status == "Signed" || l.Status == "PendingSignature" || 
                 (l.StartDate <= now && l.EndDate >= now && l.Status != "Terminated" && l.Status != "Expired" && l.Status != "Cancelled"))))
            .OrderByDescending(r => r.IsBoosted && r.BoostExpiresAt > now)
            .ThenByDescending(r => r.Landlord.IsVerified)
            .ThenByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new RoomResponseDto
            {
                Id = r.Id,
                LandlordId = r.LandlordId,
                LandlordName = r.Landlord.FullName,
                LandlordPhone = r.Landlord.PhoneNumber,
                Title = r.Title,
                Description = r.Description,
                Price = r.Price,
                Area = r.Area,
                Utilities = r.Utilities,
                RoomType = r.RoomType,
                Address = r.Address,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                DistanceKm = null,
                Virtual3DUrl = r.Virtual3DUrl,
                Status = r.Status,
                IsVerifiedLandlord = r.Landlord.IsVerified,
                CreatedAt = r.CreatedAt,
                IsBoosted = r.IsBoosted && r.BoostExpiresAt > now,
                BoostExpiresAt = r.BoostExpiresAt,
                BoostType = r.BoostType,
                Images = r.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        try
        {
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(featured, _cacheJsonOptions), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });
        }
        catch { }

        return ServiceResult<List<RoomResponseDto>>.Ok(featured);
    }

    public async Task<ServiceResult<RoomResponseDto>> GetRoomByIdAsync(Guid id, Guid? currentUserId, bool isAdmin, string? clientIp)
    {
        var cacheKey = $"room:detail:{id}";
        var legacyCacheKey = $"room_detail:{id}";

        RoomResponseDto? dto = null;

        // 1. Check L1 In-Memory Cache (ultrafast < 1ms response)
        if (_memoryCache.TryGetValue(cacheKey, out RoomResponseDto? memCached) && memCached != null)
        {
            dto = memCached;
        }

        // 2. Check L2 Distributed Cache on L1 miss
        if (dto == null)
        {
            try
            {
                var cachedJson = await _cache.GetStringAsync(cacheKey) ?? await _cache.GetStringAsync(legacyCacheKey);
                if (!string.IsNullOrEmpty(cachedJson))
                {
                    dto = JsonSerializer.Deserialize<RoomResponseDto>(cachedJson, _cacheJsonOptions);
                    if (dto != null)
                    {
                        _memoryCache.Set(cacheKey, dto, new MemoryCacheEntryOptions
                        {
                            SlidingExpiration = TimeSpan.FromMinutes(10),
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
                        });
                    }
                }
            }
            catch { }
        }

        // 3. Fallback to Database on Cache Miss
        if (dto == null)
        {
            var room = await _db.Rooms
                .AsNoTracking()
                .Include(r => r.Landlord)
                .Include(r => r.Images)
                .FirstOrDefaultAsync(r => r.Id == id);

            var hasActiveLease = await _db.LeaseContracts.AnyAsync(l => l.RoomId == room.Id && 
                (l.Status == "Active" || l.Status == "Signed" || l.Status == "PendingSignature" || 
                 (l.StartDate <= DateTime.UtcNow && l.EndDate >= DateTime.UtcNow && l.Status != "Terminated" && l.Status != "Expired" && l.Status != "Cancelled")));

            dto = new RoomResponseDto
            {
                Id = room.Id,
                LandlordId = room.LandlordId,
                LandlordName = room.Landlord?.FullName ?? "Chủ phòng",
                LandlordPhone = room.Landlord?.PhoneNumber,
                Title = room.Title,
                Description = room.Description,
                Price = room.Price,
                Area = room.Area,
                Utilities = room.Utilities,
                RoomType = room.RoomType,
                Address = room.Address,
                Latitude = room.Latitude,
                Longitude = room.Longitude,
                DistanceKm = null,
                Virtual3DUrl = room.Virtual3DUrl,
                Status = (hasActiveLease && room.Status != RoomStatus.Hidden && room.Status != RoomStatus.PendingApproval)
                    ? RoomStatus.Rented
                    : room.Status,
                IsVerifiedLandlord = room.Landlord?.IsVerified ?? false,
                CreatedAt = room.CreatedAt,
                IsBoosted = room.IsBoosted && room.BoostExpiresAt > DateTime.UtcNow,
                BoostExpiresAt = room.BoostExpiresAt,
                BoostType = room.BoostType,
                Images = room.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            };

            // Store in L1 MemoryCache (10m sliding expiration)
            _memoryCache.Set(cacheKey, dto, new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(10),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
            });

            // Store in L2 DistributedCache
            try
            {
                var json = JsonSerializer.Serialize(dto, _cacheJsonOptions);
                await _cache.SetStringAsync(cacheKey, json, new DistributedCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromMinutes(10)
                });
            }
            catch { }
        }

        // 4. Access visibility check
        if (!isAdmin && dto.LandlordId != currentUserId)
        {
            if (dto.Status != RoomStatus.Available && dto.Status != RoomStatus.Rented)
            {
                return ServiceResult<RoomResponseDto>.NotFound("Phòng trọ này hiện chưa được công khai.");
            }
        }

        // 5. Decoupled View Tracking: debounce via cache & enqueue into background channel without blocking DB
        try
        {
            var ip = clientIp ?? "unknown";
            var viewerKey = currentUserId.HasValue ? currentUserId.Value.ToString() : ip;
            var viewLockKey = $"room_view_lock:{id}:{viewerKey}";

            var alreadyViewed = await _cache.GetStringAsync(viewLockKey);
            if (string.IsNullOrEmpty(alreadyViewed))
            {
                await _cache.SetStringAsync(viewLockKey, "1", new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
                });

                _viewChannel.Writer.TryWrite(new RoomView
                {
                    Id = Guid.NewGuid(),
                    RoomId = id,
                    ViewerId = currentUserId,
                    EventType = "DetailView",
                    IpAddress = ip,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        catch (Exception ex)
        {
            // Suppress analytics failure
            Console.WriteLine($"[View Tracking Notice]: {ex.Message}");
        }

        return ServiceResult<RoomResponseDto>.Ok(dto);
    }

    public async Task<ServiceResult<RoomResponseDto>> CreateRoomAsync(CreateRoomDto dto, Guid landlordId)
    {
        var user = await _db.Users.FindAsync(landlordId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return ServiceResult<RoomResponseDto>.Fail("Tài khoản của bạn chưa phải là Chủ trọ.", 400);
        }

        if (!user.IsVerified)
        {
            return ServiceResult<RoomResponseDto>.Fail("Tài khoản Chủ trọ của bạn chưa được xác minh danh tính. Vui lòng gửi yêu cầu xác minh trước khi đăng tin.", 400);
        }

        // ponytail: enforce subscription plan room limit (Free: 2, Pro: 15, Business: Unlimited)
        var activeSub = await _db.LandlordSubscriptions
            .Where(s => s.LandlordId == landlordId && s.IsActive && s.EndDate > DateTime.UtcNow)
            .OrderByDescending(s => s.StartDate)
            .FirstOrDefaultAsync();

        var planName = activeSub?.PlanName ?? "Free";
        int maxRooms = planName.Equals("Business", StringComparison.OrdinalIgnoreCase) || planName.Equals("Enterprise", StringComparison.OrdinalIgnoreCase)
            ? int.MaxValue
            : (planName.Equals("Pro", StringComparison.OrdinalIgnoreCase) ? 15 : 2);

        var currentActiveRooms = await _db.Rooms.CountAsync(r => 
            r.LandlordId == landlordId && 
            r.Status != RoomStatus.Hidden);

        if (currentActiveRooms >= maxRooms)
        {
            var planLabel = planName.Equals("Pro", StringComparison.OrdinalIgnoreCase) ? "Gói Chuyên Nghiệp (Pro - tối đa 15 phòng)" : "Gói Miễn Phí (Free - tối đa 2 phòng)";
            return ServiceResult<RoomResponseDto>.Fail(
                $"Bạn đã đạt giới hạn số lượng tin đăng của {planLabel}. Vui lòng nâng cấp gói dịch vụ để đăng thêm phòng mới.", 
                400);
        }

        Point? locationPoint = null;
        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
        {
            locationPoint = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };
        }

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Price = dto.Price,
            Area = dto.Area,
            Utilities = dto.Utilities?.Trim() ?? string.Empty,
            RoomType = dto.RoomType.Trim(),
            Address = dto.Address.Trim(),
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Location = locationPoint,
            Virtual3DUrl = dto.Virtual3DUrl,
            Status = RoomStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        {
            for (int i = 0; i < dto.ImageUrls.Count; i++)
            {
                var rawUrl = dto.ImageUrls[i];
                var safeUrl = (!string.IsNullOrWhiteSpace(rawUrl) && rawUrl.Length > 200000)
                    ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                    : rawUrl;
                room.Images.Add(new RoomImage
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ImageUrl = safeUrl,
                    IsPrimary = i == 0
                });
            }
        }

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();

        // Publish event to Kafka for async notification & moderation pipeline
        if (_kafkaProducer != null)
        {
            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = room.Id,
                EventType = "NewRoomPendingApproval",
                UserId = null,
                Title = "Tin đăng phòng mới chờ duyệt",
                Message = $"Chủ trọ vừa đăng phòng '{room.Title}', đang chờ duyệt.",
                Type = "Room",
                LinkUrl = $"/admin/rooms",
                CreatedAt = room.CreatedAt,
                Metadata = new Dictionary<string, object?>
                {
                    ["roomId"] = room.Id.ToString(),
                    ["title"] = room.Title,
                    ["landlordId"] = room.LandlordId.ToString(),
                    ["createdAt"] = room.CreatedAt.ToString("o")
                }
            });
        }

        try
        {
            var adminPayload = new
            {
                roomId = room.Id,
                title = room.Title,
                landlordId = room.LandlordId,
                createdAt = room.CreatedAt
            };
            await _hubContext.Clients.Group("admins").SendAsync("NewRoomPending", adminPayload);
            await _hubContext.Clients.Group("admins").SendAsync("NewRoomPendingApproval", adminPayload);
        }
        catch
        {
            // Suppress real-time notify failure
        }

        var responseDto = new RoomResponseDto
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            Utilities = room.Utilities,
            RoomType = room.RoomType,
            Address = room.Address,
            Latitude = room.Latitude,
            Longitude = room.Longitude,
            DistanceKm = null,
            Virtual3DUrl = room.Virtual3DUrl,
            Status = room.Status,
            CreatedAt = room.CreatedAt,
            Images = room.Images.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList()
        };

        await InvalidateFeaturedRoomsCacheAsync();
        return ServiceResult<RoomResponseDto>.Ok(responseDto, 201);
    }

    public async Task<ServiceResult<RoomResponseDto>> UpdateRoomAsync(Guid id, UpdateRoomDto dto, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Images).Include(r => r.Landlord).FirstOrDefaultAsync(r => r.Id == id);
        if (room == null) return ServiceResult<RoomResponseDto>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<RoomResponseDto>.Forbidden();
        }

        bool isLandlordSelfEdit = (room.LandlordId == currentUserId);
        bool isAdminEdit = isAdmin && !isLandlordSelfEdit;
        var oldStatus = room.Status;

        bool criticalFieldsChanged = (room.Title != dto.Title) ||
                                     (room.Price != dto.Price) ||
                                     (room.Address != dto.Address) ||
                                     (room.Description != dto.Description);

        if (!isAdmin && room.Status == RoomStatus.Available && criticalFieldsChanged)
        {
            room.Status = RoomStatus.PendingApproval;
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = currentUserId,
                Title = "Tin đăng phòng cần kiểm duyệt lại",
                Message = $"Tin đăng '{room.Title}' đã được cập nhật thông tin quan trọng và chuyển về trạng thái chờ duyệt.",
                Type = "System",
                LinkUrl = $"/rooms/{room.Id}",
                CreatedAt = DateTime.UtcNow
            });
        }
        else if (dto.Status != room.Status)
        {
            if (isAdmin)
            {
                room.Status = dto.Status;
            }
            else
            {
                if (room.Status == RoomStatus.PendingApproval)
                {
                    if (dto.Status == RoomStatus.Available)
                    {
                        return ServiceResult<RoomResponseDto>.Fail("Phòng trọ đang chờ duyệt không thể tự chuyển sang trạng thái 'Đang cho thuê'.", 400);
                    }
                    room.Status = RoomStatus.PendingApproval;
                }
                else if (room.Status == RoomStatus.Available || room.Status == RoomStatus.Rented || room.Status == RoomStatus.Hidden)
                {
                    if (dto.Status == RoomStatus.Available || dto.Status == RoomStatus.Rented || dto.Status == RoomStatus.Hidden)
                    {
                        room.Status = dto.Status;
                    }
                    else
                    {
                        return ServiceResult<RoomResponseDto>.Fail("Chủ trọ chỉ có thể chuyển đổi trạng thái giữa 'Đang cho thuê', 'Đã thuê' hoặc 'Ẩn tin'.", 400);
                    }
                }
            }
        }

        room.Title = dto.Title;
        room.Description = dto.Description;
        room.Price = dto.Price;
        room.Area = dto.Area;
        room.Utilities = dto.Utilities;
        room.RoomType = dto.RoomType;
        room.Address = dto.Address;
        room.Virtual3DUrl = dto.Virtual3DUrl;

        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
        {
            room.Latitude = dto.Latitude;
            room.Longitude = dto.Longitude;
            room.Location = new Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };
        }

        if (dto.ImageUrls != null)
        {
            _db.RoomImages.RemoveRange(room.Images);

            if (dto.ImageUrls.Count > 0)
            {
                var newImages = dto.ImageUrls.Select((url, index) => new RoomImage
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ImageUrl = (!string.IsNullOrWhiteSpace(url) && url.Length > 200000)
                        ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                        : url,
                    IsPrimary = index == 0
                }).ToList();

                _db.RoomImages.AddRange(newImages);
            }
        }

        await _db.SaveChangesAsync();

        if (isAdminEdit)
        {
            string notifTitle;
            string notifMessage;
            string eventType;

            if (dto.Status == RoomStatus.Hidden && oldStatus != RoomStatus.Hidden)
            {
                notifTitle = "Phòng trọ đã bị ẩn bởi Quản trị viên";
                notifMessage = $"Quản trị viên đã ẩn bài đăng phòng '{room.Title}' của bạn trên hệ thống.";
                eventType = "RoomHiddenByAdmin";
            }
            else if (dto.Status == RoomStatus.Available && oldStatus == RoomStatus.Hidden)
            {
                notifTitle = "Phòng trọ đã được Quản trị viên mở hiển thị lại";
                notifMessage = $"Bài đăng phòng '{room.Title}' của bạn đã được Quản trị viên kích hoạt hiển thị lại trên hệ thống.";
                eventType = "RoomRestoredByAdmin";
            }
            else
            {
                notifTitle = "Thông tin phòng trọ đã được Quản trị viên cập nhật";
                notifMessage = $"Quản trị viên đã chỉnh sửa thông tin bài đăng phòng '{room.Title}' của bạn.";
                eventType = "RoomUpdatedByAdmin";
            }

            var notif = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = room.LandlordId,
                Title = notifTitle,
                Message = notifMessage,
                Type = "Room",
                LinkUrl = $"/rooms/{room.Id}",
                CreatedAt = DateTime.UtcNow
            };
            _db.Notifications.Add(notif);
            await _db.SaveChangesAsync();

            if (_hubContext != null)
            {
                try
                {
                    await _hubContext.Clients.User(room.LandlordId.ToString()).SendAsync("ReceiveNotification", new
                    {
                        id = notif.Id,
                        title = notif.Title,
                        message = notif.Message,
                        type = notif.Type,
                        linkUrl = notif.LinkUrl,
                        createdAt = notif.CreatedAt
                    });
                }
                catch { }
            }

            if (_kafkaProducer != null)
            {
                try
                {
                    await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
                    {
                        Id = notif.Id,
                        EventType = eventType,
                        UserId = room.LandlordId,
                        Title = notifTitle,
                        Message = notifMessage,
                        Type = "Room",
                        LinkUrl = notif.LinkUrl,
                        CreatedAt = notif.CreatedAt,
                        Metadata = new Dictionary<string, object?>
                        {
                            ["roomId"] = room.Id.ToString(),
                            ["roomTitle"] = room.Title,
                            ["oldStatus"] = oldStatus.ToString(),
                            ["newStatus"] = room.Status.ToString()
                        }
                    });
                }
                catch { }
            }
        }

        if (room.Status == RoomStatus.PendingApproval)
        {
            try
            {
                await _hubContext.Clients.Group("admins").SendAsync("NewRoomPendingApproval", new
                {
                    roomId = room.Id.ToString(),
                    title = room.Title,
                    landlordId = room.LandlordId.ToString(),
                    landlordName = room.Landlord?.FullName ?? "Chủ trọ",
                    price = room.Price,
                    address = room.Address,
                    createdAt = DateTime.UtcNow.ToString("o")
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SignalR Room Re-moderation Notice]: {ex.Message}");
            }
        }

        var responseDto = new RoomResponseDto
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            LandlordName = room.Landlord?.FullName ?? "",
            LandlordPhone = room.Landlord?.PhoneNumber,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            Utilities = room.Utilities,
            RoomType = room.RoomType,
            Address = room.Address,
            Latitude = room.Latitude,
            Longitude = room.Longitude,
            Virtual3DUrl = room.Virtual3DUrl,
            Status = room.Status,
            IsVerifiedLandlord = room.Landlord?.IsVerified ?? false,
            CreatedAt = room.CreatedAt,
            Images = room.Images.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList()
        };

        await InvalidateRoomsCacheAsync(id);
        return ServiceResult<RoomResponseDto>.Ok(responseDto);
    }

    public async Task<ServiceResult<object>> UpdateRoomStatusAsync(Guid id, RoomStatus status, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Landlord).FirstOrDefaultAsync(r => r.Id == id);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        var oldStatus = room.Status;
        if (oldStatus == status)
        {
            return ServiceResult<object>.Ok(new { message = "Trạng thái phòng không thay đổi.", status = (int)room.Status });
        }

        if (!isAdmin)
        {
            if (room.Status == RoomStatus.PendingApproval && status == RoomStatus.Available)
            {
                return ServiceResult<object>.Fail("Phòng trọ đang chờ duyệt không thể tự chuyển sang trạng thái 'Đang cho thuê'.", 400);
            }
            if (status != RoomStatus.Available && status != RoomStatus.Rented && status != RoomStatus.Hidden)
            {
                return ServiceResult<object>.Fail("Chủ trọ chỉ có thể chuyển đổi trạng thái giữa 'Đang cho thuê', 'Đã thuê' hoặc 'Ẩn tin'.", 400);
            }
        }

        room.Status = status;
        await _db.SaveChangesAsync();

        if (isAdmin && room.LandlordId != currentUserId)
        {
            string notifTitle = (status == RoomStatus.Hidden)
                ? "Phòng trọ đã bị ẩn bởi Quản trị viên"
                : (status == RoomStatus.Available ? "Phòng trọ đã được Quản trị viên mở hiển thị lại" : "Cập nhật trạng thái tin đăng");
            string notifMessage = (status == RoomStatus.Hidden)
                ? $"Quản trị viên đã ẩn bài đăng phòng '{room.Title}' của bạn trên hệ thống."
                : (status == RoomStatus.Available ? $"Bài đăng phòng '{room.Title}' của bạn đã được Quản trị viên kích hoạt hiển thị lại trên hệ thống." : $"Tin đăng '{room.Title}' đã được quản trị viên đổi sang trạng thái: {status}.");

            var notif = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = room.LandlordId,
                Title = notifTitle,
                Message = notifMessage,
                Type = "Room",
                LinkUrl = $"/rooms/{room.Id}",
                CreatedAt = DateTime.UtcNow
            };
            _db.Notifications.Add(notif);
            await _db.SaveChangesAsync();

            if (_hubContext != null)
            {
                try
                {
                    await _hubContext.Clients.User(room.LandlordId.ToString()).SendAsync("ReceiveNotification", new
                    {
                        id = notif.Id,
                        title = notif.Title,
                        message = notif.Message,
                        type = notif.Type,
                        linkUrl = notif.LinkUrl,
                        createdAt = notif.CreatedAt
                    });
                }
                catch { }
            }

            if (_kafkaProducer != null)
            {
                try
                {
                    await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
                    {
                        Id = notif.Id,
                        EventType = (status == RoomStatus.Hidden) ? "RoomHiddenByAdmin" : "RoomRestoredByAdmin",
                        UserId = room.LandlordId,
                        Title = notifTitle,
                        Message = notifMessage,
                        Type = "Room",
                        LinkUrl = notif.LinkUrl,
                        CreatedAt = notif.CreatedAt
                    });
                }
                catch { }
            }
        }

        await InvalidateRoomsCacheAsync(id);
        return ServiceResult<object>.Ok(new { message = "Cập nhật trạng thái thành công.", status = (int)room.Status });
    }

    public async Task<ServiceResult<object>> DeleteRoomAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        bool isLandlordSelfDelete = (room.LandlordId == currentUserId);
        bool isAdminDelete = isAdmin && !isLandlordSelfDelete;
        var landlordId = room.LandlordId;
        var roomTitle = room.Title;

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();

        if (isAdminDelete)
        {
            var notif = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = landlordId,
                Title = "Phòng trọ đã bị gỡ bỏ bởi Quản trị viên",
                Message = $"Bài đăng phòng '{roomTitle}' của bạn đã bị Quản trị viên xóa khỏi hệ thống.",
                Type = "Room",
                LinkUrl = "/landlord/rooms",
                CreatedAt = DateTime.UtcNow
            };
            _db.Notifications.Add(notif);
            await _db.SaveChangesAsync();

            if (_hubContext != null)
            {
                try
                {
                    await _hubContext.Clients.User(landlordId.ToString()).SendAsync("ReceiveNotification", new
                    {
                        id = notif.Id,
                        title = notif.Title,
                        message = notif.Message,
                        type = notif.Type,
                        linkUrl = notif.LinkUrl,
                        createdAt = notif.CreatedAt
                    });
                }
                catch { }
            }

            if (_kafkaProducer != null)
            {
                try
                {
                    await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
                    {
                        Id = notif.Id,
                        EventType = "RoomDeletedByAdmin",
                        UserId = landlordId,
                        Title = notif.Title,
                        Message = notif.Message,
                        Type = "Room",
                        LinkUrl = notif.LinkUrl,
                        CreatedAt = notif.CreatedAt,
                        Metadata = new Dictionary<string, object?>
                        {
                            ["roomId"] = id.ToString(),
                            ["roomTitle"] = roomTitle
                        }
                    });
                }
                catch { }
            }
        }

        await InvalidateRoomsCacheAsync(id);
        return ServiceResult<object>.Ok(new { message = "Đã xoá phòng trọ thành công." });
    }

    public async Task<ServiceResult<List<RoomImageDto>>> GetRoomImagesAsync(Guid roomId)
    {
        var images = await _db.RoomImages
            .Where(img => img.RoomId == roomId)
            .Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            })
            .ToListAsync();

        return ServiceResult<List<RoomImageDto>>.Ok(images);
    }

    public async Task<ServiceResult<RoomImageDto>> AddRoomImageAsync(Guid roomId, IFormFile file, bool isPrimary, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return ServiceResult<RoomImageDto>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<RoomImageDto>.Forbidden();
        }

        if (!IsValidImageFile(file, out var error))
        {
            return ServiceResult<RoomImageDto>.Fail(error ?? "Ảnh không hợp lệ.", 400);
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        var imageUrl = await _imageService.UploadImageAsync(memoryStream, file.FileName);
        if (string.IsNullOrEmpty(imageUrl))
        {
            return ServiceResult<RoomImageDto>.Fail("Tải ảnh lên máy chủ lưu trữ thất bại. Vui lòng thử lại sau.", 502);
        }

        if (isPrimary)
        {
            foreach (var img in room.Images)
            {
                img.IsPrimary = false;
            }
        }

        var roomImage = new RoomImage
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            ImageUrl = imageUrl,
            IsPrimary = isPrimary || room.Images.Count == 0
        };

        _db.RoomImages.Add(roomImage);
        await _db.SaveChangesAsync();

        await InvalidateRoomsCacheAsync(roomId);

        return ServiceResult<RoomImageDto>.Ok(new RoomImageDto
        {
            Id = roomImage.Id,
            ImageUrl = roomImage.ImageUrl,
            IsPrimary = roomImage.IsPrimary
        });
    }

    public async Task<ServiceResult<object>> DeleteRoomImageAsync(Guid roomId, Guid imageId, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        var roomImage = await _db.RoomImages.FirstOrDefaultAsync(img => img.Id == imageId && img.RoomId == roomId);
        if (roomImage == null) return ServiceResult<object>.NotFound("Không tìm thấy ảnh.");

        _db.RoomImages.Remove(roomImage);
        await _db.SaveChangesAsync();

        await InvalidateRoomsCacheAsync(roomId);

        return ServiceResult<object>.Ok(new { message = "Đã xoá ảnh khỏi phòng thành công." });
    }

    public async Task<ServiceResult<object>> SetPrimaryImageAsync(Guid roomId, Guid imageId, Guid currentUserId, bool isAdmin)
    {
        var room = await _db.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (!isAdmin && room.LandlordId != currentUserId)
        {
            return ServiceResult<object>.Forbidden();
        }

        var targetImage = room.Images.FirstOrDefault(img => img.Id == imageId);
        if (targetImage == null) return ServiceResult<object>.NotFound("Không tìm thấy hình ảnh này trong phòng.");

        foreach (var img in room.Images)
        {
            img.IsPrimary = img.Id == imageId;
        }

        await _db.SaveChangesAsync();
        await InvalidateRoomsCacheAsync(roomId);
        return ServiceResult<object>.Ok(new { message = "Đã đặt làm ảnh chính thành công." });
    }

    public async Task<ServiceResult<object>> ReportRoomAsync(Guid roomId, CreateRoomReportDto dto, Guid reporterId)
    {
        var roomExists = await _db.Rooms.AnyAsync(r => r.Id == roomId);
        if (!roomExists) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return ServiceResult<object>.Fail("Vui lòng chọn lý do báo cáo.", 400);
        }

        var report = new RoomReport
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            ReporterId = reporterId,
            Reason = dto.Reason.Trim(),
            Details = dto.Details?.Trim() ?? string.Empty,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.RoomReports.Add(report);
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Gửi báo cáo thành công. Ban quản trị sẽ tiến hành xác minh.", reportId = report.Id });
    }

    public async Task<ServiceResult<object>> TrackVirtualTourClickAsync(Guid roomId, Guid? currentUserId, string? clientIp)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        try
        {
            _viewChannel.Writer.TryWrite(new RoomView
            {
                Id = Guid.NewGuid(),
                RoomId = roomId,
                ViewerId = currentUserId,
                EventType = "VirtualTourClick",
                IpAddress = clientIp ?? "unknown",
                CreatedAt = DateTime.UtcNow
            });
        }
        catch
        {
            // Suppress analytics failure
        }

        return ServiceResult<object>.Ok(new { message = "Ghi nhận tương tác thành công." });
    }

    public async Task<ServiceResult<object>> UploadGeneralImageAsync(IFormFile file)
    {
        if (!IsValidImageFile(file, out var error))
        {
            return ServiceResult<object>.Fail(error ?? "Tập tin ảnh không hợp lệ.", 400);
        }

        try
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var imageUrl = await _imageService.UploadImageAsync(memoryStream, file.FileName);
            if (string.IsNullOrEmpty(imageUrl))
            {
                return ServiceResult<object>.Fail("Tải ảnh lên máy chủ lưu trữ thất bại. Vui lòng thử lại sau.", 502);
            }

            return ServiceResult<object>.Ok(new { imageUrl });
        }
        catch (Exception ex)
        {
            return ServiceResult<object>.Fail($"Tải ảnh thất bại: {ex.Message}", 400);
        }
    }
}
