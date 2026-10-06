using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

// ponytail: TrustSafetyController exposes trust score breakdown, property verification, and admin moderation
[ApiController]
[Route("api/[controller]")]
public class TrustSafetyController : BaseApiController
{
    private readonly ITrustSafetyService _trustSafetyService;

    public TrustSafetyController(ITrustSafetyService trustSafetyService)
    {
        _trustSafetyService = trustSafetyService;
    }

    // 1. Transparent Trust Score (Explainable breakdown for any room)
    [HttpGet("rooms/{roomId:guid}/score")]
    public async Task<IActionResult> GetRoomTrustScore(Guid roomId)
    {
        var result = await _trustSafetyService.CalculateTrustScoreAsync(roomId);
        return HandleResult(result);
    }

    // 2. Submit Property Verification (Landlord submits ownership documents)
    [HttpPost("property-verification")]
    [Authorize]
    public async Task<IActionResult> SubmitPropertyVerification([FromBody] SubmitPropertyVerificationDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _trustSafetyService.SubmitPropertyVerificationAsync(userId.Value, dto);
        return HandleResult(result);
    }

    // 3. Admin Moderation Queue
    [HttpGet("moderation/reports")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetModerationQueue([FromQuery] string? status, [FromQuery] string? riskLevel)
    {
        var result = await _trustSafetyService.GetModerationQueueAsync(status, riskLevel);
        return HandleResult(result);
    }

    // 4. Resolve Moderation Report
    [HttpPost("moderation/reports/{id:guid}/resolve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResolveReport(Guid id, [FromBody] ResolveReportDto dto)
    {
        var moderatorId = GetCurrentUserId();
        if (!moderatorId.HasValue) return Unauthorized();

        var email = User.FindFirstValue(ClaimTypes.Email) ?? "admin@dormi.vn";
        var result = await _trustSafetyService.ResolveReportAsync(id, moderatorId.Value, email, dto);
        return HandleResult(result);
    }

    // 5. Audit Trail Logs
    [HttpGet("moderation/audit-logs")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int limit = 50)
    {
        var result = await _trustSafetyService.GetAuditLogsAsync(limit);
        return HandleResult(result);
    }
}
