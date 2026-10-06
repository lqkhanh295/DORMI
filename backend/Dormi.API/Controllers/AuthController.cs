using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return HandleResult(result);
    }

    [HttpGet("captcha")]
    public async Task<IActionResult> GetCaptcha()
    {
        var result = await _authService.GenerateCaptchaChallengeAsync();
        return HandleResult(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _authService.LoginAsync(dto, clientIp);
        return HandleResult(result);
    }

    [HttpPost("verify-mfa")]
    public async Task<IActionResult> VerifyMfa([FromBody] VerifyMfaDto dto)
    {
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _authService.VerifyMfaAsync(dto, clientIp);
        return HandleResult(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _authService.GetMeAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(429)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _authService.ForgotPasswordAsync(dto, clientIp);
        return HandleResult(result);
    }

    [HttpPost("verify-otp")]
    [ProducesResponseType(typeof(VerifyOtpResponseDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _authService.VerifyOtpAsync(dto, clientIp);
        return HandleResult(result);
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await _authService.ResetPasswordAsync(dto);
        return HandleResult(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _authService.ChangePasswordAsync(userId.Value, dto);
        return HandleResult(result);
    }
}
