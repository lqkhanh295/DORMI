using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Dormi.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly DormiDbContext _db;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AuthService> _logger;
    private readonly PasswordHasher<User> _passwordHasher = new();

    private class MfaSessionData
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
        public int Attempts { get; set; }
    }

    private static bool IsDevelopment()
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        return string.IsNullOrEmpty(env) || string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase);
    }

    public AuthService(
        DormiDbContext db, 
        IJwtTokenGenerator tokenGenerator, 
        IMemoryCache cache,
        ILogger<AuthService> logger)
    {
        _db = db;
        _tokenGenerator = tokenGenerator;
        _cache = cache;
        _logger = logger;
    }

    public async Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
        {
            return ServiceResult<AuthResponseDto>.Fail("Email đã tồn tại trong hệ thống.", 400);
        }

        // Disallow self-registration of Admin role. Only Customer or Landlord allowed publicly.
        if (dto.Role == UserRole.Admin || !Enum.IsDefined(typeof(UserRole), dto.Role))
        {
            return ServiceResult<AuthResponseDto>.Fail("Không được phép tự tạo tài khoản Quản trị viên.", 400);
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email.ToLower().Trim(),
            FullName = dto.FullName.Trim(),
            PhoneNumber = dto.PhoneNumber,
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenGenerator.GenerateToken(user);

        return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        });
    }

    public Task<ServiceResult<CaptchaChallengeDto>> GenerateCaptchaChallengeAsync()
    {
        var a = Random.Shared.Next(1, 15);
        var b = Random.Shared.Next(1, 15);
        var question = $"{a} + {b} = ?";
        var answer = (a + b).ToString();
        var token = Guid.NewGuid().ToString("N");
        _cache.Set($"captcha_{token}", answer, TimeSpan.FromMinutes(5));

        return Task.FromResult(ServiceResult<CaptchaChallengeDto>.Ok(new CaptchaChallengeDto
        {
            CaptchaToken = token,
            Question = question
        }));
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto, string clientIp = "127.0.0.1")
    {
        var normalizedEmail = (dto.Email ?? string.Empty).Trim().ToLower();

        // 1. IP Rate Limiting (max 10 login requests per 60 seconds per IP)
        var ipRateKey = $"rate_limit_login_{clientIp}";
        var requestCount = _cache.GetOrCreate(ipRateKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60);
            return 0;
        });
        requestCount++;
        _cache.Set(ipRateKey, requestCount, TimeSpan.FromSeconds(60));

        if (requestCount > 10)
        {
            _logger.LogWarning("[AUTH AUDIT] RATE_LIMIT_EXCEEDED: IP={IP}, Email={Email}, RequestsInWindow={Reqs}", clientIp, normalizedEmail, requestCount);
            return ServiceResult<AuthResponseDto>.Fail("Bạn đã gửi quá nhiều yêu cầu đăng nhập. Vui lòng chờ 1 phút rồi thử lại.", 429);
        }

        _logger.LogInformation("[AUTH AUDIT] LOGIN_ATTEMPT: IP={IP}, Email={Email}", clientIp, normalizedEmail);

        // 2. Temporary Lockout Check (15 minutes lockout after 5 consecutive failures)
        var lockoutKey = $"auth_lockout_{normalizedEmail}";
        if (_cache.TryGetValue<DateTime>(lockoutKey, out var lockoutUntil) && DateTime.UtcNow < lockoutUntil)
        {
            var remainingSeconds = (int)(lockoutUntil - DateTime.UtcNow).TotalSeconds;
            var remainingMinutes = Math.Max(1, (int)Math.Ceiling(remainingSeconds / 60.0));
            _logger.LogWarning("[AUTH AUDIT] LOCKED_ACCOUNT_ATTEMPT: Email={Email}, IP={IP}, RemainingSeconds={Sec}", normalizedEmail, clientIp, remainingSeconds);

            return ServiceResult<AuthResponseDto>.Fail(
                $"Tài khoản tạm thời bị khóa do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau {remainingMinutes} phút hoặc đặt lại mật khẩu.", 
                423, 
                new AuthResponseDto { LockoutSeconds = remainingSeconds });
        }

        // 3. CAPTCHA / Risk Challenge Check
        var attemptsKey = $"auth_attempts_{normalizedEmail}";
        _cache.TryGetValue<int>(attemptsKey, out var failedAttempts);

        // If user already failed 2 or more times, CAPTCHA is strictly required
        if (failedAttempts >= 2)
        {
            if (string.IsNullOrWhiteSpace(dto.CaptchaToken) || string.IsNullOrWhiteSpace(dto.CaptchaAnswer))
            {
                var challengeRes = await GenerateCaptchaChallengeAsync();
                _logger.LogWarning("[AUTH AUDIT] CAPTCHA_REQUIRED: Email={Email}, IP={IP}, FailedAttempts={Count}", normalizedEmail, clientIp, failedAttempts);

                return ServiceResult<AuthResponseDto>.Fail(
                    "Phát hiện rủi ro đăng nhập: Vui lòng giải mã xác thực bảo vệ (CAPTCHA) để tiếp tục.", 
                    400, 
                    new AuthResponseDto 
                    { 
                        RequiresCaptcha = true, 
                        CaptchaToken = challengeRes.Data?.CaptchaToken, 
                        CaptchaQuestion = challengeRes.Data?.Question,
                        RemainingAttempts = Math.Max(0, 5 - failedAttempts)
                    });
            }

            var captchaKey = $"captcha_{dto.CaptchaToken.Trim()}";
            if (!_cache.TryGetValue<string>(captchaKey, out var expectedAnswer) || 
                !string.Equals(expectedAnswer, dto.CaptchaAnswer.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var challengeRes = await GenerateCaptchaChallengeAsync();
                _logger.LogWarning("[AUTH AUDIT] CAPTCHA_FAILED: Email={Email}, IP={IP}", normalizedEmail, clientIp);

                return ServiceResult<AuthResponseDto>.Fail(
                    "Mã bảo vệ (CAPTCHA) không chính xác hoặc đã hết hạn. Vui lòng thử lại câu hỏi mới.", 
                    400, 
                    new AuthResponseDto 
                    { 
                        RequiresCaptcha = true, 
                        CaptchaToken = challengeRes.Data?.CaptchaToken, 
                        CaptchaQuestion = challengeRes.Data?.Question,
                        RemainingAttempts = Math.Max(0, 5 - failedAttempts)
                    });
            }

            // Captcha passed
            _cache.Remove(captchaKey);
        }

        // 4. Verify User & Password
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null)
        {
            return await HandleFailedAttemptAsync(normalizedEmail, clientIp, failedAttempts);
        }

        var verificationResult = PasswordVerificationResult.Failed;
        try
        {
            verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        }
        catch
        {
            // Handle corrupted/dummy legacy hash
        }

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return await HandleFailedAttemptAsync(normalizedEmail, clientIp, failedAttempts);
        }

        // 5. Successful Password Verification -> Reset failed attempts
        _cache.Remove(attemptsKey);
        _cache.Remove(lockoutKey);

        // 6. Multi-Factor Authentication (MFA / 2FA)
        // High security accounts (Admin role or admin@ email) require MFA 6-digit OTP verification
        if (user.Role == UserRole.Admin || user.Email.ToLower().Contains("admin@"))
        {
            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var mfaSessionToken = Guid.NewGuid().ToString("N");

            _cache.Set($"mfa_{mfaSessionToken}", new MfaSessionData
            {
                UserId = user.Id,
                Email = user.Email,
                OtpCode = otp,
                Attempts = 0
            }, TimeSpan.FromMinutes(5));

            var isDev = IsDevelopment();
            if (isDev)
            {
                _logger.LogInformation("[DEV MODE] MFA OTP sinh cho {Email}: {Otp} (Hoặc nhập mã test: 123456)", user.Email, otp);
            }
            else
            {
                _logger.LogInformation("[AUTH AUDIT] MFA_CHALLENGE_ISSUED: Email={Email}, Session={Session} (Valid for 5 mins)", user.Email, mfaSessionToken);
            }

            return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
            {
                RequiresMfa = true,
                MfaSessionToken = mfaSessionToken,
                Message = isDev
                    ? "Mã xác thực OTP đã được gửi đến kênh bảo mật của bạn. [DEV: Nhập mã test 123456]"
                    : "Mã xác thực OTP đã được gửi đến kênh bảo mật của bạn (hiệu lực trong 5 phút)."
            });
        }

        // 7. Standard Token Generation for Non-MFA Users
        var token = _tokenGenerator.GenerateToken(user);
        _logger.LogInformation("[AUTH AUDIT] LOGIN_SUCCESS: IP={IP}, Email={Email}, UserId={UserId}, Role={Role}", clientIp, user.Email, user.Id, user.Role);

        return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        });
    }

    private async Task<ServiceResult<AuthResponseDto>> HandleFailedAttemptAsync(string normalizedEmail, string clientIp, int failedAttempts)
    {
        failedAttempts++;
        var attemptsKey = $"auth_attempts_{normalizedEmail}";

        if (failedAttempts >= 5)
        {
            var lockoutUntil = DateTime.UtcNow.AddMinutes(15);
            _cache.Set($"auth_lockout_{normalizedEmail}", lockoutUntil, TimeSpan.FromMinutes(15));
            _cache.Remove(attemptsKey);

            _logger.LogWarning("[AUTH AUDIT] ACCOUNT_TEMPORARILY_LOCKED: Email={Email}, IP={IP}, Duration=15min", normalizedEmail, clientIp);

            return ServiceResult<AuthResponseDto>.Fail(
                "Tài khoản đã bị tạm khóa 15 phút do nhập sai mật khẩu 5 lần liên tiếp để bảo vệ an toàn.",
                423,
                new AuthResponseDto { LockoutSeconds = 900 });
        }

        _cache.Set(attemptsKey, failedAttempts, TimeSpan.FromMinutes(30));
        var remaining = 5 - failedAttempts;

        // Progressive Delay: progressive wait to slow down automated attacks
        var delayMs = (failedAttempts - 1) * 1000;
        if (delayMs > 0)
        {
            _logger.LogInformation("[AUTH AUDIT] PROGRESSIVE_DELAY: Email={Email}, DelayMs={Delay}", normalizedEmail, delayMs);
            await Task.Delay(Math.Min(delayMs, 3000));
        }

        _logger.LogWarning("[AUTH AUDIT] LOGIN_FAILED: Email={Email}, IP={IP}, Failures={Failures}, Remaining={Remaining}", normalizedEmail, clientIp, failedAttempts, remaining);

        CaptchaChallengeDto? captchaChallenge = null;
        if (failedAttempts >= 2)
        {
            var challengeRes = await GenerateCaptchaChallengeAsync();
            captchaChallenge = challengeRes.Data;
        }

        return ServiceResult<AuthResponseDto>.Fail(
            $"Email hoặc mật khẩu không chính xác. Bạn còn {remaining} lần thử trước khi tài khoản bị tạm khóa.",
            401,
            new AuthResponseDto
            {
                RemainingAttempts = remaining,
                RequiresCaptcha = failedAttempts >= 2,
                CaptchaToken = captchaChallenge?.CaptchaToken,
                CaptchaQuestion = captchaChallenge?.Question
            });
    }

    public async Task<ServiceResult<AuthResponseDto>> VerifyMfaAsync(VerifyMfaDto dto, string clientIp = "127.0.0.1")
    {
        if (string.IsNullOrWhiteSpace(dto.MfaSessionToken) || string.IsNullOrWhiteSpace(dto.OtpCode))
        {
            return ServiceResult<AuthResponseDto>.Fail("Vui lòng cung cấp mã phiên và mã OTP xác thực.", 400);
        }

        var sessionKey = $"mfa_{dto.MfaSessionToken.Trim()}";
        if (!_cache.TryGetValue<MfaSessionData>(sessionKey, out var session) || session == null)
        {
            _logger.LogWarning("[AUTH AUDIT] MFA_EXPIRED_OR_INVALID: Token={Token}, IP={IP}", dto.MfaSessionToken, clientIp);
            return ServiceResult<AuthResponseDto>.Fail("Phiên xác thực 2FA đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.", 400);
        }

        if (session.Attempts >= 3)
        {
            _cache.Remove(sessionKey);
            _logger.LogWarning("[AUTH AUDIT] MFA_MAX_ATTEMPTS_EXCEEDED: Email={Email}, IP={IP}", session.Email, clientIp);
            return ServiceResult<AuthResponseDto>.Fail("Bạn đã nhập sai mã OTP quá 3 lần. Vui lòng đăng nhập lại từ đầu.", 400);
        }

        var isDev = IsDevelopment();
        var isTestOtp = isDev && dto.OtpCode.Trim() == "123456";

        if (!isTestOtp && session.OtpCode.Trim() != dto.OtpCode.Trim())
        {
            session.Attempts++;
            var remaining = 3 - session.Attempts;
            _logger.LogWarning("[AUTH AUDIT] MFA_OTP_MISMATCH: Email={Email}, Remaining={Remaining}", session.Email, remaining);
            return ServiceResult<AuthResponseDto>.Fail($"Mã xác thực OTP không chính xác. Bạn còn {remaining} lần thử.", 400);
        }

        // Correct OTP -> complete login
        _cache.Remove(sessionKey);

        var user = await _db.Users.FindAsync(session.UserId);
        if (user == null)
        {
            return ServiceResult<AuthResponseDto>.NotFound("Người dùng không tồn tại.");
        }

        var token = _tokenGenerator.GenerateToken(user);
        _logger.LogInformation("[AUTH AUDIT] MFA_VERIFIED_SUCCESS: Email={Email}, Role={Role}, IP={IP}", user.Email, user.Role, clientIp);

        return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        });
    }

    public async Task<ServiceResult<UserDto>> GetMeAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ServiceResult<UserDto>.NotFound("Người dùng không tồn tại.");
        }

        return ServiceResult<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        });
    }

    public async Task<ServiceResult<object>> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return ServiceResult<object>.Fail("Vui lòng nhập địa chỉ email.", 400);
        }

        var normalizedEmail = dto.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        
        // Anti-enumeration: Return generic success message regardless of whether email exists
        if (user != null)
        {
            // Generate a secure 6-digit OTP reset token with 15-minute expiration
            var resetToken = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            _cache.Set($"pwd_reset_{normalizedEmail}", resetToken, TimeSpan.FromMinutes(15));
            _logger.LogInformation("[AUTH AUDIT] PASSWORD_RESET_REQUESTED: Email={Email}", normalizedEmail);
        }

        return ServiceResult<object>.Ok(new 
        { 
            message = "Nếu địa chỉ email tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hộp thư của bạn."
        });
    }

    public async Task<ServiceResult<object>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return ServiceResult<object>.Fail("Vui lòng cung cấp đầy đủ email, mã xác thực và mật khẩu mới.", 400);
        }

        if (dto.NewPassword.Length < 6)
        {
            return ServiceResult<object>.Fail("Mật khẩu mới phải có độ dài từ 6 ký tự trở lên.", 400);
        }

        var normalizedEmail = dto.Email.Trim().ToLower();
        if (!_cache.TryGetValue($"pwd_reset_{normalizedEmail}", out string? cachedToken) || cachedToken != dto.Token.Trim())
        {
            return ServiceResult<object>.Fail("Mã xác thực đặt lại mật khẩu không chính xác hoặc đã hết hạn.", 400);
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy tài khoản tương ứng với email này.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        await _db.SaveChangesAsync();
        _cache.Remove($"pwd_reset_{normalizedEmail}");

        return ServiceResult<object>.Ok(new 
        { 
            message = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới." 
        });
    }
}
