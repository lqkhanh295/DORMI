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
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly DormiDbContext _db;

    public RoomsController(DormiDbContext db)
    {
        _db = db;
    }

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

        var rooms = await query
            .OrderByDescending(r => r.CreatedAt)
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

    [HttpGet("{id}")]
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

        return CreatedAtAction(nameof(GetRoomById), new { id = room.Id }, new { id = room.Id, message = "Tạo thông tin phòng thành công." });
    }

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

        room.Title = dto.Title;
        room.Description = dto.Description;
        room.Price = dto.Price;
        room.Area = dto.Area;
        room.Utilities = dto.Utilities;
        room.RoomType = dto.RoomType;
        room.Address = dto.Address;
        room.Virtual3DUrl = dto.Virtual3DUrl;

        // ponytail: Enforce room status transition rules for Landlords
        if (dto.Status != room.Status)
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
        return Ok(new { message = "Cập nhật phòng thành công." });
    }

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
