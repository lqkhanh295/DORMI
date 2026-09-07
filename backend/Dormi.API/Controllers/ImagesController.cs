using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IImageService _imageService;
    private readonly DormiDbContext _db;

    public ImagesController(IImageService imageService, DormiDbContext db)
    {
        _imageService = imageService;
        _db = db;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn tập tin ảnh hợp lệ." });
        }

        using var stream = file.OpenReadStream();
        var imageUrl = await _imageService.UploadImageAsync(stream, file.FileName);

        if (string.IsNullOrEmpty(imageUrl))
        {
            return BadRequest(new { message = "Tải ảnh lên Cloudinary thất bại." });
        }

        return Ok(new { imageUrl });
    }

    [HttpPost("rooms/{roomId}")]
    [Authorize]
    public async Task<IActionResult> UploadRoomImage(Guid roomId, IFormFile file, [FromQuery] bool isPrimary = false)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var room = await _db.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng trọ." });

        if (room.LandlordId != userId) return Forbid();

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn tập tin ảnh hợp lệ." });
        }

        using var stream = file.OpenReadStream();
        var imageUrl = await _imageService.UploadImageAsync(stream, file.FileName);

        if (string.IsNullOrEmpty(imageUrl))
        {
            return BadRequest(new { message = "Tải ảnh lên Cloudinary thất bại." });
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

        return Ok(new
        {
            id = roomImage.Id,
            imageUrl = roomImage.ImageUrl,
            isPrimary = roomImage.IsPrimary
        });
    }

    [HttpDelete("rooms/{roomId}/{imageId}")]
    [Authorize]
    public async Task<IActionResult> DeleteRoomImage(Guid roomId, Guid imageId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng." });

        if (room.LandlordId != userId) return Forbid();

        var roomImage = await _db.RoomImages.FirstOrDefaultAsync(img => img.Id == imageId && img.RoomId == roomId);
        if (roomImage == null) return NotFound(new { message = "Không tìm thấy ảnh." });

        _db.RoomImages.Remove(roomImage);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xoá ảnh khỏi phòng thành công." });
    }
}
