using System;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

// ponytail: PostRentalController exposes post-lease operations:
// Payments (Rail A), Maintenance ticketing, Renewal, and Move-out checkout.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostRentalController : BaseApiController
{
    private readonly IPostRentalService _service;

    public PostRentalController(IPostRentalService service)
    {
        _service = service;
    }

    // --- 1. Post-rental summary ---
    [HttpGet("leases/{leaseId:guid}/summary")]
    public async Task<IActionResult> GetSummary(Guid leaseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.GetPostRentalSummaryAsync(leaseId, userId.Value);
        return HandleResult(result);
    }

    // --- 2. Payment schedules (Rail A: Tenant -> Landlord) ---
    [HttpGet("leases/{leaseId:guid}/payments")]
    public async Task<IActionResult> GetPaymentSchedules(Guid leaseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.GetPaymentSchedulesAsync(leaseId, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("leases/{leaseId:guid}/payments")]
    public async Task<IActionResult> CreatePaymentSchedule(Guid leaseId, [FromBody] CreatePaymentScheduleDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        dto.LeaseContractId = leaseId;
        var result = await _service.CreatePaymentScheduleAsync(dto, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("payments/{scheduleId:guid}/record")]
    public async Task<IActionResult> RecordPayment(Guid scheduleId, [FromBody] RecordPaymentDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.RecordPaymentAsync(scheduleId, dto, userId.Value);
        return HandleResult(result);
    }

    // --- 3. Maintenance ticketing ---
    [HttpGet("maintenance")]
    public async Task<IActionResult> GetMaintenanceRequests([FromQuery] Guid? leaseId, [FromQuery] bool? isLandlord)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var landlordFlag = User.IsInRole("Landlord");
        var result = await _service.GetMaintenanceRequestsAsync(leaseId, userId.Value, landlordFlag);
        return HandleResult(result);
    }

    [HttpGet("maintenance/{id:guid}")]
    public async Task<IActionResult> GetMaintenanceRequestById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.GetMaintenanceRequestByIdAsync(id, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("maintenance")]
    public async Task<IActionResult> CreateMaintenanceRequest([FromBody] CreateMaintenanceRequestDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.CreateMaintenanceRequestAsync(dto, userId.Value);
        return HandleResult(result);
    }

    [HttpPut("maintenance/{id:guid}/status")]
    public async Task<IActionResult> UpdateMaintenanceStatus(Guid id, [FromBody] UpdateMaintenanceStatusDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.UpdateMaintenanceStatusAsync(id, dto, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("maintenance/{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmMaintenanceResolution(Guid id, [FromBody] ConfirmMaintenanceResolutionDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.ConfirmMaintenanceResolutionAsync(id, dto, userId.Value);
        return HandleResult(result);
    }

    // --- 4. Lease renewal ---
    [HttpPost("leases/{leaseId:guid}/renewal/request")]
    public async Task<IActionResult> RequestRenewal(Guid leaseId, [FromBody] RequestRenewalDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.RequestRenewalAsync(leaseId, dto, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("leases/{leaseId:guid}/renewal/respond")]
    public async Task<IActionResult> RespondRenewal(Guid leaseId, [FromBody] RespondRenewalDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.RespondRenewalAsync(leaseId, dto, userId.Value);
        return HandleResult(result);
    }

    // --- 5. Move-out & deposit settlement ---
    [HttpPost("leases/{leaseId:guid}/moveout/request")]
    public async Task<IActionResult> RequestMoveOut(Guid leaseId, [FromBody] RequestMoveOutDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.RequestMoveOutAsync(leaseId, dto, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("leases/{leaseId:guid}/moveout/inspection")]
    public async Task<IActionResult> CompleteMoveOutInspection(Guid leaseId, [FromBody] MoveOutInspectionDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _service.CompleteMoveOutInspectionAsync(leaseId, dto, userId.Value);
        return HandleResult(result);
    }
}
