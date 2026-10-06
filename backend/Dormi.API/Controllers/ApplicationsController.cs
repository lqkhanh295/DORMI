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
[Authorize]
public class ApplicationsController : BaseApiController
{
    private readonly IRentalApplicationService _applicationService;

    public ApplicationsController(IRentalApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateApplication([FromBody] CreateApplicationDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _applicationService.CreateApplicationAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _applicationService.GetTenantApplicationsAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpGet("landlord")]
    public async Task<IActionResult> GetLandlordApplications([FromQuery] ApplicationStatus? status)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _applicationService.GetLandlordApplicationsAsync(userId.Value, status);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetApplicationById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _applicationService.GetApplicationByIdAsync(id, userId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/review")]
    public async Task<IActionResult> ReviewApplication(Guid id, [FromBody] ReviewApplicationDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _applicationService.ReviewApplicationAsync(id, userId.Value, dto);
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/withdraw")]
    public async Task<IActionResult> WithdrawApplication(Guid id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _applicationService.WithdrawApplicationAsync(id, userId.Value);
        return HandleResult(result);
    }
}
