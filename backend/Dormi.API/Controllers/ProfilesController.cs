using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilesController : BaseApiController
{
    private readonly IProfileService _profileService;

    public ProfilesController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("customer")]
    public async Task<IActionResult> GetCustomerProfile()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _profileService.GetCustomerProfileAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPut("customer")]
    public async Task<IActionResult> UpdateCustomerProfile([FromBody] CustomerProfileDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _profileService.UpdateCustomerProfileAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("landlord")]
    public async Task<IActionResult> GetLandlordProfile()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _profileService.GetLandlordProfileAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPut("landlord")]
    public async Task<IActionResult> UpdateLandlordProfile([FromBody] LandlordProfileDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _profileService.UpdateLandlordProfileAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpPost("landlord/verification")]
    public async Task<IActionResult> SubmitLandlordVerification([FromBody] SubmitVerificationDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _profileService.SubmitLandlordVerificationAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("landlord/verification")]
    public async Task<IActionResult> GetLandlordVerification()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _profileService.GetLandlordVerificationAsync(userId.Value);
        return HandleResult(result);
    }
}
