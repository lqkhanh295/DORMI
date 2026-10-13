using System;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/landlord")]
[Authorize(Roles = "Landlord")]
public class LandlordDashboardController : BaseApiController
{
    private readonly ILandlordDashboardService _dashboardService;

    public LandlordDashboardController(ILandlordDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.GetAnalyticsAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpGet("lead-analytics")]
    public async Task<IActionResult> GetLeadAnalytics([FromQuery] Guid? roomId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.GetLeadAnalyticsAsync(userId.Value, roomId);
        return HandleResult(result);
    }

    [HttpGet("billing")]
    public async Task<IActionResult> GetBillingHistory()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.GetBillingHistoryAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutSubscription([FromBody] CheckoutDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _dashboardService.CheckoutSubscriptionAsync(userId.Value, dto, clientIp);
        return HandleResult(result);
    }

    [HttpGet("payment/status/{transactionRef}")]
    public async Task<IActionResult> GetPaymentStatus(string transactionRef)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.GetPaymentStatusAsync(userId.Value, transactionRef);
        return HandleResult(result);
    }

    [HttpPost("payment/simulate-gateway")]
    public async Task<IActionResult> SimulateGatewayPayment([FromBody] PaymentVerifyDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.SimulateGatewayPaymentAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpPost("payment/verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.VerifyPaymentAsync(userId.Value, dto);
        return HandleResult(result);
    }

    [HttpGet("payment/vnpay-return")]
    [AllowAnonymous]
    public async Task<IActionResult> VnpayReturn([FromQuery] string vnp_TxnRef, [FromQuery] string vnp_ResponseCode, [FromQuery] string vnp_SecureHash)
    {
        var queryParams = HttpContext.Request.Query
            .Where(q => q.Key.StartsWith("vnp_") && q.Key != "vnp_SecureHash" && q.Key != "vnp_SecureHashType")
            .OrderBy(q => q.Key)
            .ToDictionary(q => q.Key, q => q.Value.ToString());

        var result = await _dashboardService.ProcessVnpayReturnAsync(queryParams, vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash);
        if (!result.Success)
        {
            return HandleResult(result);
        }

        return Redirect(result.Data!);
    }

    [HttpPost("payment/payos-webhook")]
    [HttpPost("/api/payos/webhook")]
    [HttpPost("/api/payment/payos-webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> PayOSWebhook([FromBody] PayOS.Models.Webhooks.Webhook webhook)
    {
        var result = await _dashboardService.ProcessPayOSWebhookAsync(webhook);
        return HandleResult(result);
    }

    [HttpPost("payment/payos-confirm-webhook")]
    [HttpPost("/api/payos/confirm-webhook")]
    [Authorize]
    public async Task<IActionResult> ConfirmPayOSWebhook([FromBody] ConfirmPayOSWebhookDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.WebhookUrl))
        {
            return BadRequest(new { message = "WebhookUrl không được để trống." });
        }
        var result = await _dashboardService.ConfirmPayOSWebhookUrlAsync(dto.WebhookUrl);
        return HandleResult(result);
    }

    [HttpGet("discover-tenants")]
    public async Task<IActionResult> DiscoverTenants()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.DiscoverTenantsAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPost("rooms/{roomId:guid}/boost")]
    public async Task<IActionResult> BoostRoom(Guid roomId, [FromBody] BoostRoomDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _dashboardService.BoostRoomAsync(userId.Value, roomId, dto, clientIp);
        return HandleResult(result);
    }

    [HttpPost("invite-tenant")]
    public async Task<IActionResult> InviteTenant([FromBody] InviteTenantDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _dashboardService.InviteTenantToRoomAsync(userId.Value, dto);
        return HandleResult(result);
    }
}
