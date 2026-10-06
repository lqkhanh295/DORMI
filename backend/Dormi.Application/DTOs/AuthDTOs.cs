using System;
using Dormi.Domain.Enums;

namespace Dormi.Application.DTOs;

public class RegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public string? PhoneNumber { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? CaptchaToken { get; set; }
    public string? CaptchaAnswer { get; set; }
}

public class VerifyMfaDto
{
    public string Email { get; set; } = string.Empty;
    public string MfaSessionToken { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class CaptchaChallengeDto
{
    public string CaptchaToken { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public bool RequiresMfa { get; set; }
    public string? MfaSessionToken { get; set; }
    public bool RequiresCaptcha { get; set; }
    public string? CaptchaToken { get; set; }
    public string? CaptchaQuestion { get; set; }
    public int? RemainingAttempts { get; set; }
    public int? LockoutSeconds { get; set; }
    public string? Message { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}

public class VerifyOtpDto
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}

public class VerifyOtpResponseDto
{
    public string ResetToken { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    public string? Email { get; set; }
    public string? Token { get; set; }
    public string? ResetToken { get; set; }
    public string NewPassword { get; set; } = string.Empty;

    public string GetEffectiveToken()
    {
        if (!string.IsNullOrWhiteSpace(ResetToken)) return ResetToken.Trim();
        if (!string.IsNullOrWhiteSpace(Token)) return Token.Trim();
        return string.Empty;
    }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
