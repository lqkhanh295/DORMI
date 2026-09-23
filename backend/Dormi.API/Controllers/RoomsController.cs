using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : BaseApiController
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms([FromQuery] RoomQueryFilterDto filter)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _roomService.GetRoomsAsync(filter, currentUserId, IsAdmin(), User.IsInRole("Landlord"));
        return HandleResult(result);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedRooms([FromQuery] int limit = 6)
    {
        var result = await _roomService.GetFeaturedRoomsAsync(limit);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _roomService.GetRoomByIdAsync(id, currentUserId, IsAdmin(), clientIp);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Landlord,Admin")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.CreateRoomAsync(dto, currentUserId.Value);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] UpdateRoomDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.UpdateRoomAsync(id, dto, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.DeleteRoomAsync(id, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpGet("{id:guid}/images")]
    public async Task<IActionResult> GetRoomImages(Guid id)
    {
        var result = await _roomService.GetRoomImagesAsync(id);
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/images")]
    [Authorize]
    public async Task<IActionResult> AddRoomImage(Guid id, IFormFile file, [FromQuery] bool isPrimary = false)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.AddRoomImageAsync(id, file, isPrimary, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteRoomImage(Guid id, Guid imageId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.DeleteRoomImageAsync(id, imageId, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/images/{imageId:guid}/primary")]
    [Authorize]
    public async Task<IActionResult> SetPrimaryImage(Guid id, Guid imageId)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.SetPrimaryImageAsync(id, imageId, currentUserId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/report")]
    [Authorize]
    public async Task<IActionResult> ReportRoom(Guid id, [FromBody] CreateRoomReportDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roomService.ReportRoomAsync(id, dto, currentUserId.Value);
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/virtual-tour-click")]
    public async Task<IActionResult> TrackVirtualTourClick(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _roomService.TrackVirtualTourClickAsync(id, currentUserId, clientIp);
        return HandleResult(result);
    }
}
