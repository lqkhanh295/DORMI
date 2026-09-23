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
public class TenantReviewsController : BaseApiController
{
    private readonly ITenantReviewService _tenantReviewService;

    public TenantReviewsController(ITenantReviewService tenantReviewService)
    {
        _tenantReviewService = tenantReviewService;
    }

    [HttpGet("leases")]
    public async Task<IActionResult> GetMyLeases()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _tenantReviewService.GetMyLeasesAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> RateTenant([FromBody] CreateTenantReviewDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _tenantReviewService.RateTenantAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("tenant/{tenantId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTenantReputation(Guid tenantId)
    {
        var result = await _tenantReviewService.GetTenantReputationAsync(tenantId);
        return HandleResult(result);
    }
}
