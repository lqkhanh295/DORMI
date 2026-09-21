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
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Dormi.API.Hubs;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly DormiDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;

    public RoomsController(DormiDbContext db, IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Get all rooms.
    /// </summary>
    /// <param name="filter">The room filter.</param>
    /// <returns>A list of rooms.</returns>
    [HttpGet]
    public async Task<IActionResult> GetRooms([FromQuery] RoomQueryFilterDto filter)
    {
        var query = _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var searchTerm = filter.Query.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(searchTerm) || 
                                     r.Address.ToLower().Contains(searchTerm) ||
                                     r.Description.ToLower().Contains(searchTerm));
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
            var districtTerm = filter.District.Trim().ToLower();
            query = query.Where(r => r.Address.ToLower().Contains(districtTerm));
        }

        NetTopologySuite.Geometries.Point? userPoint = null;
        if (filter.Latitude.HasValue && filter.Longitude.HasValue)
        {
            userPoint = new NetTopologySuite.Geometries.Point(filter.Longitude.Value, filter.Latitude.Value) { SRID = 4326 };
            if (filter.RadiusKm.HasValue && filter.RadiusKm.Value > 0)
            {
                // In PostGIS geography(Point, 4326), distance is measured accurately along the spheroid in meters
                double distanceMeters = filter.RadiusKm.Value * 1000.0;
                query = query.Where(r => r.Location != null && r.Location.IsWithinDistance(userPoint, distanceMeters));
            }
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid.TryParse(userIdClaim, out var currentUserId);
        bool isAdmin = User.IsInRole("Admin");
        bool isLandlord = User.IsInRole("Landlord");

        // ponytail: Strict visibility rules to prevent leaking PendingApproval/Hidden listings to public
        if (isAdmin)
        {
            if (filter.Status.HasValue)
            {
                query = query.Where(r => r.Status == filter.Status.Value);
            }
        }
        else if (isLandlord && currentUserId != Guid.Empty)
        {
            if (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))
            {
                query = query.Where(r => r.LandlordId == currentUserId && r.Status == filter.Status.Value);
            }
            else if (filter.Status.HasValue)
            {
                query = query.Where(r => r.Status == filter.Status.Value);
            }
            else
            {
                query = query.Where(r => r.LandlordId == currentUserId);
            }
        }
        else
        {
            // Anonymous / Customer: Can strictly ONLY see Available (or Rented if explicitly filtered)
            if (filter.Status.HasValue && (filter.Status.Value == RoomStatus.PendingApproval || filter.Status.Value == RoomStatus.Hidden))
            {
                return Forbid();
            }

            if (filter.Status.HasValue && filter.Status.Value == RoomStatus.Rented)
            {
                query = query.Where(r => r.Status == RoomStatus.Rented);
            }
            else
            {
                query = query.Where(r => r.Status == RoomStatus.Available);
            }
        }

        var totalItems = await query.CountAsync();
        var page = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;

        query = filter.SortBy switch
        {
            "price-asc" or "price-low" => query.OrderBy(r => r.Price),
            "price-desc" or "price-high" => query.OrderByDescending(r => r.Price),
            "oldest" => query.OrderBy(r => r.CreatedAt),
            "area-desc" => query.OrderByDescending(r => r.Area),
            "area-asc" => query.OrderBy(r => r.Area),
            "verified" => query.OrderByDescending(r => r.Landlord.IsVerified).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
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
                Status = r.Status,
                IsVerifiedLandlord = r.Landlord.IsVerified,
                CreatedAt = r.CreatedAt,
                Images = r.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        return Ok(new
        {
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
            Data = rooms
        });
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedRooms([FromQuery] int limit = 6)
    {
        var featured = await _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .Where(r => r.Status == RoomStatus.Available)
            .OrderByDescending(r => r.Landlord.IsVerified)
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
                Images = r.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        return Ok(featured);
    }

    /// <summary>
    /// Get room by ID.
    /// </summary>
    /// <param name="id">The room ID.</param>
    /// <returns>The room.</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
        var room = await _db.Rooms
            .Include(r => r.Landlord)
            .Include(r => r.Images)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid.TryParse(userIdClaim, out var currentUserId);
        bool isAdmin = User.IsInRole("Admin");

        // ponytail: PendingApproval or Hidden rooms cannot be viewed by public users or other landlords
        if (!isAdmin && room.LandlordId != currentUserId)
        {
            if (room.Status != RoomStatus.Available && room.Status != RoomStatus.Rented)
            {
                return NotFound(new { message = "Phòng trọ này hiện chưa được công khai." });
            }
        }

        // ponytail: Record real RoomView event for aggregate analytics with 30-minute deduplication cooldown
        try
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var cooldown = DateTime.UtcNow.AddMinutes(-30);
            bool alreadyViewed = false;

            if (currentUserId != Guid.Empty)
            {
                alreadyViewed = await _db.RoomViews.AnyAsync(v =>
                    v.RoomId == room.Id &&
                    v.ViewerId == currentUserId &&
                    v.EventType == "View" &&
                    v.CreatedAt >= cooldown);
            }
            else
            {
                alreadyViewed = await _db.RoomViews.AnyAsync(v =>
                    v.RoomId == room.Id &&
                    v.ViewerId == null &&
                    v.IpAddress == ip &&
                    v.EventType == "View" &&
                    v.CreatedAt >= cooldown);
            }

            if (!alreadyViewed)
            {
                _db.RoomViews.Add(new RoomView
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ViewerId = currentUserId != Guid.Empty ? currentUserId : null,
                    EventType = "View",
                    IpAddress = ip,
                    CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }
        }
        catch {}

        var response = new RoomResponseDto
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            LandlordName = room.Landlord.FullName,
            LandlordPhone = room.Landlord.PhoneNumber,
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
            IsVerifiedLandlord = room.Landlord.IsVerified,
            CreatedAt = room.CreatedAt,
            Images = room.Images.Select(img => new RoomImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList()
        };

        return Ok(response);
    }

    /// <summary>
    /// Create a room.
    /// Only landlords can create rooms.
    /// The landlord must have verified identity (CCCD/approval) before publishing rooms.
    /// </summary>
    /// <param name="dto">The room data.</param>
    /// <returns>The created room.</returns>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Landlord)
        {
            return BadRequest(new { message = "Tài khoản của bạn chưa phải là Chủ trọ." });
        }

        // ponytail: Landlord must have verified identity (CCCD/approval) before publishing rooms
        if (!user.IsVerified)
        {
            return BadRequest(new { message = "Tài khoản Chủ trọ của bạn chưa được xác minh danh tính. Vui lòng gửi yêu cầu xác minh trước khi đăng tin." });
        }

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            Area = dto.Area,
            Utilities = dto.Utilities,
            RoomType = dto.RoomType,
            Address = dto.Address,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Location = (dto.Latitude.HasValue && dto.Longitude.HasValue)
                ? new NetTopologySuite.Geometries.Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 }
                : null,
            Virtual3DUrl = dto.Virtual3DUrl,
            Status = RoomStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        {
            for (int i = 0; i < dto.ImageUrls.Count; i++)
            {
                room.Images.Add(new RoomImage
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ImageUrl = dto.ImageUrls[i],
                    IsPrimary = i == 0
                });
            }
        }

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();

        // SignalR: Notify Admins that a new room is pending approval
        try
        {
            await _hubContext.Clients.Group("admins").SendAsync("NewRoomPendingApproval", new
            {
                roomId = room.Id.ToString(),
                title = room.Title,
                landlordId = user.Id.ToString(),
                landlordName = user.FullName,
                price = room.Price,
                address = room.Address,
                createdAt = room.CreatedAt.ToString("o")
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SignalR Room Creation Notice]: {ex.Message}");
        }

        return CreatedAtAction(nameof(GetRoomById), new { id = room.Id }, new { id = room.Id, message = "Tạo thông tin phòng thành công." });
    }

    /// <summary>
    /// Update a room.
    /// Only landlords can update rooms.
    /// </summary>
    /// <param name="id">The room ID.</param>
    /// <param name="dto">The room data.</param>
    /// <returns>The updated room.</returns>
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] UpdateRoomDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == id);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        if (room.LandlordId != userId)
        {
            return Forbid();
        }

        // ponytail: Re-moderation rule: If approved room has critical fields altered, reset to PendingApproval
        bool criticalFieldsChanged = (room.Title != dto.Title) ||
                                     (room.Price != dto.Price) ||
                                     (room.Address != dto.Address) ||
                                     (room.Description != dto.Description);

        if (room.Status == RoomStatus.Available && criticalFieldsChanged)
        {
            room.Status = RoomStatus.PendingApproval;
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = "Tin đăng cần kiểm duyệt lại",
                Message = $"Tin đăng '{dto.Title}' đã chỉnh sửa thông tin cốt lõi nên cần Ban quản trị kiểm duyệt lại trước khi tiếp tục hiển thị công khai.",
                Type = "Room",
                LinkUrl = "/landlord/rooms",
                CreatedAt = DateTime.UtcNow
            });
        }
        else if (dto.Status != room.Status)
        {
            // If room is currently PendingApproval, Landlord cannot self-approve to Available
            if (room.Status == RoomStatus.PendingApproval)
            {
                if (dto.Status == RoomStatus.Available)
                {
                    return BadRequest(new { message = "Phòng trọ đang chờ duyệt không thể tự chuyển sang trạng thái 'Đang cho thuê'." });
                }
                room.Status = RoomStatus.PendingApproval;
            }
            else if (room.Status == RoomStatus.Available || room.Status == RoomStatus.Rented || room.Status == RoomStatus.Hidden)
            {
                // Once approved by admin, landlord can toggle between Available, Rented, Hidden
                if (dto.Status == RoomStatus.Available || dto.Status == RoomStatus.Rented || dto.Status == RoomStatus.Hidden)
                {
                    room.Status = dto.Status;
                }
                else
                {
                    return BadRequest(new { message = "Chủ trọ chỉ có thể chuyển đổi trạng thái giữa 'Đang cho thuê', 'Đã thuê' hoặc 'Ẩn tin'." });
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
            room.Location = new NetTopologySuite.Geometries.Point(dto.Longitude.Value, dto.Latitude.Value) { SRID = 4326 };
        }

        if (dto.ImageUrls != null)
        {
            await _db.RoomImages.Where(img => img.RoomId == id).ExecuteDeleteAsync();

            if (dto.ImageUrls.Count > 0)
            {
                var newImages = dto.ImageUrls.Select((url, index) => new RoomImage
                {
                    Id = Guid.NewGuid(),
                    RoomId = room.Id,
                    ImageUrl = url,
                    IsPrimary = index == 0
                }).ToList();

                _db.RoomImages.AddRange(newImages);
            }
        }

        await _db.SaveChangesAsync();

        if (room.Status == RoomStatus.PendingApproval)
        {
            try
            {
                await _hubContext.Clients.Group("admins").SendAsync("NewRoomPendingApproval", new
                {
                    roomId = room.Id.ToString(),
                    title = room.Title,
                    landlordId = room.LandlordId.ToString(),
                    landlordName = "Chủ trọ",
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

        return Ok(new { message = "Cập nhật phòng thành công." });
    }

    /// <summary>
    /// Delete a room.
    /// Only landlords can delete rooms.
    /// </summary>
    /// <param name="id">The room ID.</param>
    /// <returns>The deleted room.</returns>
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return NotFound();

        if (room.LandlordId != userId) return Forbid();

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xoá phòng trọ thành công." });
    }

    [Authorize]
    [HttpPost("{roomId}/report")]
    public async Task<IActionResult> ReportRoom(Guid roomId, [FromBody] CreateRoomReportDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return BadRequest(new { message = "Vui lòng chọn lý do báo cáo." });
        }

        var report = new RoomReport
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            ReporterId = userId,
            Reason = dto.Reason.Trim(),
            Details = dto.Details?.Trim() ?? string.Empty,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.RoomReports.Add(report);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Gửi báo cáo thành công. Ban quản trị sẽ tiến hành xác minh.", reportId = report.Id });
    }
}
