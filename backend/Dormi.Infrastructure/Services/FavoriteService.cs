using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Dormi.Infrastructure.Services;

public class FavoriteService : IFavoriteService
{
    private readonly DormiDbContext _db;
    private readonly IMemoryCache? _memCache;

    public FavoriteService(DormiDbContext db, IMemoryCache? memCache = null)
    {
        _db = db;
        _memCache = memCache;
    }

    public async Task<ServiceResult<List<RoomResponseDto>>> GetFavoritesAsync(Guid userId)
    {
        var cacheKey = $"favorites:{userId}";
        if (_memCache != null && _memCache.TryGetValue(cacheKey, out List<RoomResponseDto>? cached) && cached != null)
        {
            return ServiceResult<List<RoomResponseDto>>.Ok(cached);
        }

        var favorites = await _db.FavoriteRooms
            .AsNoTracking()
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

        _memCache?.Set(cacheKey, favorites, TimeSpan.FromSeconds(60));
        return ServiceResult<List<RoomResponseDto>>.Ok(favorites);
    }

    public async Task<ServiceResult<object>> AddFavoriteAsync(Guid userId, Guid roomId)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null || user.Role != UserRole.Customer)
        {
            return ServiceResult<object>.Fail("Chỉ tài khoản người thuê mới có thể lưu phòng yêu thích.", 400);
        }

        var roomExists = await _db.Rooms.AnyAsync(r => r.Id == roomId);
        if (!roomExists) return ServiceResult<object>.NotFound("Không tìm thấy phòng trọ.");

        var existing = await _db.FavoriteRooms.AnyAsync(f => f.CustomerId == userId && f.RoomId == roomId);
        if (existing)
        {
            return ServiceResult<object>.Ok(new { message = "Phòng trọ này đã có trong danh sách yêu thích." });
        }

        var favorite = new FavoriteRoom
        {
            CustomerId = userId,
            RoomId = roomId,
            SavedAt = DateTime.UtcNow
        };

        _db.FavoriteRooms.Add(favorite);
        await _db.SaveChangesAsync();

        _memCache?.Remove($"favorites:{userId}");
        return ServiceResult<object>.Ok(new { message = "Đã thêm phòng trọ vào danh sách yêu thích." });
    }

    public async Task<ServiceResult<object>> RemoveFavoriteAsync(Guid userId, Guid roomId)
    {
        var favorite = await _db.FavoriteRooms.FindAsync(userId, roomId);
        if (favorite == null) return ServiceResult<object>.NotFound("Không tìm thấy trong danh sách yêu thích.");

        _db.FavoriteRooms.Remove(favorite);
        await _db.SaveChangesAsync();

        _memCache?.Remove($"favorites:{userId}");
        return ServiceResult<object>.Ok(new { message = "Đã bỏ lưu phòng trọ yêu thích." });
    }
}
