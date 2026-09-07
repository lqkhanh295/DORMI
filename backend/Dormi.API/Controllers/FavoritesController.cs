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
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly DormiDbContext _db;

    public FavoritesController(DormiDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var favorites = await _db.FavoriteRooms
            .Include(f => f.Room).ThenInclude(r => r.Images)
            .Include(f => f.Room).ThenInclude(r => r.Landlord)
            .Where(f => f.CustomerId == userId)
            .OrderByDescending(f => f.SavedAt)
            .Select(f => new RoomResponseDto
            {
                Id = f.Room.Id,
                LandlordId = f.Room.LandlordId,
                LandlordName = f.Room.Landlord.FullName,
                LandlordPhone = f.Room.Landlord.PhoneNumber,
                Title = f.Room.Title,
                Description = f.Room.Description,
                Price = f.Room.Price,
                Area = f.Room.Area,
                Utilities = f.Room.Utilities,
                RoomType = f.Room.RoomType,
                Address = f.Room.Address,
                Virtual3DUrl = f.Room.Virtual3DUrl,
                Status = f.Room.Status,
                CreatedAt = f.Room.CreatedAt,
                Images = f.Room.Images.Select(img => new RoomImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList()
            })
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost("{roomId}")]
    public async Task<IActionResult> AddFavorite(Guid roomId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return BadRequest(new { message = "Chỉ tài khoản người thuê mới có thể lưu phòng yêu thích." });
        }

        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        var existing = await _db.FavoriteRooms.FindAsync(userId, roomId);
        if (existing != null)
        {
            return Ok(new { message = "Phòng trọ này đã có trong danh sách yêu thích." });
        }

        var favorite = new FavoriteRoom
        {
            CustomerId = userId,
            RoomId = roomId,
            SavedAt = DateTime.UtcNow
        };

        _db.FavoriteRooms.Add(favorite);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã thêm phòng trọ vào danh sách yêu thích." });
    }

    [HttpDelete("{roomId}")]
    public async Task<IActionResult> RemoveFavorite(Guid roomId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var favorite = await _db.FavoriteRooms.FindAsync(userId, roomId);
        if (favorite == null) return NotFound(new { message = "Không tìm thấy trong danh sách yêu thích." });

        _db.FavoriteRooms.Remove(favorite);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã bỏ lưu phòng trọ yêu thích." });
    }
}
