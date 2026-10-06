using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeasesController : BaseApiController
{
    private readonly ILeaseService _leaseService;

    public LeasesController(ILeaseService leaseService)
    {
        _leaseService = leaseService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLease([FromBody] CreateLeaseDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _leaseService.CreateLeaseAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyLeases()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _leaseService.GetMyLeasesAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetLeaseById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _leaseService.GetLeaseByIdAsync(id, userId.Value, IsAdmin());
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/sign")]
    public async Task<IActionResult> SignLease(Guid id, [FromBody] SignLeaseDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _leaseService.SignLeaseByTenantAsync(id, userId.Value, dto);
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/terminate")]
    public async Task<IActionResult> TerminateLease(Guid id, [FromBody] TerminateLeaseDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _leaseService.TerminateLeaseAsync(id, userId.Value, IsAdmin(), dto);
        return HandleResult(result);
    }
}
