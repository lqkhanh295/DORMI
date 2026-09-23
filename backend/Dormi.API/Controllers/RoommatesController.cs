using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoommatesController : BaseApiController
{
    private readonly IRoommateService _roommateService;

    public RoommatesController(IRoommateService roommateService)
    {
        _roommateService = roommateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoommatePosts(
        [FromQuery] string? location,
        [FromQuery] decimal? maxBudget,
        [FromQuery] string? genderPreference)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _roommateService.GetRoommatePostsAsync(location, maxBudget, genderPreference, currentUserId);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRoommatePostById(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _roommateService.GetRoommatePostByIdAsync(id, currentUserId);
        return HandleResult(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateRoommatePost([FromBody] CreateRoommatePostDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roommateService.CreateRoommatePostAsync(currentUserId.Value, dto);
        return HandleResult(result);
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRoommatePost(Guid id, [FromBody] CreateRoommatePostDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roommateService.UpdateRoommatePostAsync(id, currentUserId.Value, dto);
        return HandleResult(result);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRoommatePost(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roommateService.DeleteRoommatePostAsync(id, currentUserId.Value);
        return HandleResult(result);
    }

    [Authorize]
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations()
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var result = await _roommateService.GetRecommendationsAsync(currentUserId.Value);
        return HandleResult(result);
    }
}
