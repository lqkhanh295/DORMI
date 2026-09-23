using System;
using System.Threading.Tasks;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : BaseApiController
{
    private readonly IRoomService _roomService;

    public ImagesController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        var result = await _roomService.UploadGeneralImageAsync(file);
        return HandleResult(result);
    }

    [HttpPost("rooms/{roomId:guid}")]
    [Authorize]
    public async Task<IActionResult> UploadRoomImage(Guid roomId, IFormFile file, [FromQuery] bool isPrimary = false)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.AddRoomImageAsync(roomId, file, isPrimary, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpDelete("rooms/{roomId:guid}/{imageId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteRoomImage(Guid roomId, Guid imageId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.DeleteRoomImageAsync(roomId, imageId, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }
}
