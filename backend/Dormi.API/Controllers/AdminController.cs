using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _adminService.GetStatsAsync();
        return HandleResult(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] UserRole? role)
    {
        var result = await _adminService.GetUsersAsync(role);
        return HandleResult(result);
    }

    [HttpGet("verifications")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var result = await _adminService.GetPendingVerificationsAsync();
        return HandleResult(result);
    }

    [HttpPatch("verifications/{id:guid}")]
    [HttpPatch("verifications/{id:guid}/review")]
    public async Task<IActionResult> UpdateVerificationStatus(Guid id, [FromBody] ReviewVerificationDto dto)
    {
        var result = await _adminService.UpdateVerificationStatusAsync(id, dto);
        return HandleResult(result);
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> GetRoomsForModeration()
    {
        var result = await _adminService.GetRoomsForModerationAsync();
        return HandleResult(result);
    }

    [HttpPatch("rooms/{roomId:guid}/status")]
    public async Task<IActionResult> UpdateRoomStatus(Guid roomId, [FromQuery] RoomStatus status)
    {
        var result = await _adminService.UpdateRoomStatusAsync(roomId, status);
        return HandleResult(result);
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var result = await _adminService.GetReportsAsync();
        return HandleResult(result);
    }

    [HttpPatch("reports/{reportId:guid}/status")]
    public async Task<IActionResult> UpdateReportStatus(Guid reportId, [FromQuery] string status)
    {
        var result = await _adminService.UpdateReportStatusAsync(reportId, status);
        return HandleResult(result);
    }

    [HttpGet("roommate-posts")]
    public async Task<IActionResult> GetRoommatePostsForModeration()
    {
        var result = await _adminService.GetRoommatePostsForModerationAsync();
        return HandleResult(result);
    }

    [HttpPatch("roommate-posts/{id:guid}/status")]
    public async Task<IActionResult> UpdateRoommatePostStatus(Guid id, [FromQuery] bool isActive)
    {
        var result = await _adminService.UpdateRoommatePostStatusAsync(id, isActive);
        return HandleResult(result);
    }
}
