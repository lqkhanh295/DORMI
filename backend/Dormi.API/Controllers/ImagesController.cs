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

    private static bool IsValidImageFile(IFormFile file, out string? errorMessage)
    {
        if (file == null || file.Length == 0)
        {
            errorMessage = "Vui lòng chọn tập tin ảnh hợp lệ.";
            return false;
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            errorMessage = "Dung lượng ảnh vượt quá giới hạn tối đa 5MB.";
            return false;
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext))
        {
            errorMessage = "Định dạng tập tin không được hỗ trợ. Chỉ chấp nhận các định dạng: .jpg, .jpeg, .png, .webp.";
            return false;
        }

        var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (string.IsNullOrEmpty(file.ContentType) || !allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            errorMessage = "MIME type tập tin không hợp lệ. Chỉ chấp nhận hình ảnh JPEG, PNG, WEBP.";
            return false;
        }

        errorMessage = null;
        return true;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (!IsValidImageFile(file, out var error))
        {
            return BadRequest(new { message = error });
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

        if (!IsValidImageFile(file, out var error))
        {
            return BadRequest(new { message = error });
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
