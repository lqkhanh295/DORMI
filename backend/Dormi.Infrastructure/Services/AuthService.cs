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
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace Dormi.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly DormiDbContext _db;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IDistributedCache _cache;
    private readonly ILogger<AuthService> _logger;
    private readonly IEmailService? _emailService;
    private readonly IKafkaProducer? _kafkaProducer;
    private readonly PasswordHasher<User> _passwordHasher = new();

    private class MfaSessionData
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
        public int Attempts { get; set; }
    }

    private class PasswordResetOtpData
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string OtpHash { get; set; } = string.Empty;
        public int Attempts { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    private class PasswordResetTokenData
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    private static bool IsDevelopment()
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        return string.IsNullOrEmpty(env) || string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase);
    }

    private static string HashSha256Hex(string input)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static bool SlowEqualsHex(string hex1, string hex2)
    {
        if (string.IsNullOrWhiteSpace(hex1) || string.IsNullOrWhiteSpace(hex2)) return false;
        if (hex1.Length != hex2.Length) return false;
        try
        {
            var b1 = Convert.FromHexString(hex1);
            var b2 = Convert.FromHexString(hex2);
            return CryptographicOperations.FixedTimeEquals(b1, b2);
        }
        catch
        {
            return false;
        }
    }

    private static bool SlowEquals(string a, string b)
    {
        var aBytes = System.Text.Encoding.UTF8.GetBytes(a);
        var bBytes = System.Text.Encoding.UTF8.GetBytes(b);
        return CryptographicOperations.FixedTimeEquals(aBytes, bBytes);
    }

    private static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return string.Empty;
        var parts = email.Split('@');
        if (parts.Length != 2) return "***";
        var name = parts[0];
        var maskedName = name.Length <= 2 ? name[0] + "***" : name[0] + "***" + name[^1];
        return $"{maskedName}@{parts[1]}";
    }

    public AuthService(
        DormiDbContext db, 
        IJwtTokenGenerator tokenGenerator, 
        IDistributedCache cache,
        ILogger<AuthService> logger,
        IEmailService? emailService = null,
        IKafkaProducer? kafkaProducer = null)
    {
        _db = db;
        _tokenGenerator = tokenGenerator;
        _cache = cache;
        _logger = logger;
        _emailService = emailService;
        _kafkaProducer = kafkaProducer;
    }

    private async Task<string?> SafeGetCacheStringAsync(string key)
    {
        try
        {
            return await _cache.GetStringAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[CACHE RESILIENCE] Error reading cache key {Key}", key);
            return null;
        }
    }

    private async Task SafeSetCacheStringAsync(string key, string value, DistributedCacheEntryOptions options)
    {
        try
        {
            await _cache.SetStringAsync(key, value, options);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[CACHE RESILIENCE] Error writing cache key {Key}", key);
        }
    }

    private async Task SafeRemoveCacheAsync(string key)
    {
        try
        {
            await _cache.RemoveAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[CACHE RESILIENCE] Error removing cache key {Key}", key);
        }
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

    public async Task<ServiceResult<CaptchaChallengeDto>> GenerateCaptchaChallengeAsync()
    {
        var a = Random.Shared.Next(1, 15);
        var b = Random.Shared.Next(1, 15);
        var question = $"{a} + {b} = ?";
        var answer = (a + b).ToString();
        var token = Guid.NewGuid().ToString("N");
        await SafeSetCacheStringAsync($"captcha_{token}", answer, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        });

        return ServiceResult<CaptchaChallengeDto>.Ok(new CaptchaChallengeDto
        {
            CaptchaToken = token,
            Question = question
        });
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto, string clientIp = "127.0.0.1")
    {
        var normalizedEmail = (dto.Email ?? string.Empty).Trim().ToLower();

        // 1. IP Rate Limiting (max 10 login requests per 60 seconds per IP)
        var ipRateKey = $"rate_limit_login_{clientIp}";
        var currentReqStr = await SafeGetCacheStringAsync(ipRateKey);
        var requestCount = int.TryParse(currentReqStr, out var c) ? c + 1 : 1;
        await SafeSetCacheStringAsync(ipRateKey, requestCount.ToString(), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60)
        });

        if (requestCount > 10)
        {
            _logger.LogWarning("[AUTH AUDIT] RATE_LIMIT_EXCEEDED: IP={IP}, Email={Email}, RequestsInWindow={Reqs}", clientIp, normalizedEmail, requestCount);
            return ServiceResult<AuthResponseDto>.Fail("Bạn đã gửi quá nhiều yêu cầu đăng nhập. Vui lòng chờ 1 phút rồi thử lại.", 429);
        }

        _logger.LogInformation("[AUTH AUDIT] LOGIN_ATTEMPT: IP={IP}, Email={Email}", clientIp, normalizedEmail);

        // 2. Temporary Lockout Check (15 minutes lockout after 5 consecutive failures)
        var lockoutKey = $"auth_lockout_{normalizedEmail}";
        var lockoutVal = await SafeGetCacheStringAsync(lockoutKey);
        if (!string.IsNullOrEmpty(lockoutVal) && DateTime.TryParse(lockoutVal, out var lockoutUntil) && DateTime.UtcNow < lockoutUntil)
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
        var attemptsVal = await SafeGetCacheStringAsync(attemptsKey);
        int.TryParse(attemptsVal, out var failedAttempts);

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
            var expectedAnswer = await SafeGetCacheStringAsync(captchaKey);
            if (string.IsNullOrEmpty(expectedAnswer) || 
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
            await SafeRemoveCacheAsync(captchaKey);
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
        await SafeRemoveCacheAsync(attemptsKey);
        await SafeRemoveCacheAsync(lockoutKey);

        // 6. Multi-Factor Authentication (MFA / 2FA)
        // High security accounts (Admin role or admin@ email) require MFA 6-digit OTP verification
        if (user.Role == UserRole.Admin || user.Email.ToLower().Contains("admin@"))
        {
            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var mfaSessionToken = Guid.NewGuid().ToString("N");

            var sessionData = new MfaSessionData
            {
                UserId = user.Id,
                Email = user.Email,
                OtpCode = otp,
                Attempts = 0
            };

            await SafeSetCacheStringAsync($"mfa_{mfaSessionToken}", JsonSerializer.Serialize(sessionData), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });

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
            await SafeSetCacheStringAsync($"auth_lockout_{normalizedEmail}", lockoutUntil.ToString("O"), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            });
            await SafeRemoveCacheAsync(attemptsKey);

            _logger.LogWarning("[AUTH AUDIT] ACCOUNT_TEMPORARILY_LOCKED: Email={Email}, IP={IP}, Duration=15min", normalizedEmail, clientIp);

            return ServiceResult<AuthResponseDto>.Fail(
                "Tài khoản đã bị tạm khóa 15 phút do nhập sai mật khẩu 5 lần liên tiếp để bảo vệ an toàn.",
                423,
                new AuthResponseDto { LockoutSeconds = 900 });
        }

        await SafeSetCacheStringAsync(attemptsKey, failedAttempts.ToString(), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
        });
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
        var sessionJson = await SafeGetCacheStringAsync(sessionKey);
        if (string.IsNullOrEmpty(sessionJson))
        {
            _logger.LogWarning("[AUTH AUDIT] MFA_EXPIRED_OR_INVALID: Token={Token}, IP={IP}", dto.MfaSessionToken, clientIp);
            return ServiceResult<AuthResponseDto>.Fail("Phiên xác thực 2FA đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.", 400);
        }

        var session = JsonSerializer.Deserialize<MfaSessionData>(sessionJson);
        if (session == null)
        {
            return ServiceResult<AuthResponseDto>.Fail("Dữ liệu phiên xác thực 2FA không hợp lệ.", 400);
        }

        if (session.Attempts >= 3)
        {
            await SafeRemoveCacheAsync(sessionKey);
            _logger.LogWarning("[AUTH AUDIT] MFA_MAX_ATTEMPTS_EXCEEDED: Email={Email}, IP={IP}", session.Email, clientIp);
            return ServiceResult<AuthResponseDto>.Fail("Bạn đã nhập sai mã OTP quá 3 lần. Vui lòng đăng nhập lại từ đầu.", 400);
        }

        var isDev = IsDevelopment();
        var isTestOtp = isDev && dto.OtpCode.Trim() == "123456";

        if (!isTestOtp && session.OtpCode.Trim() != dto.OtpCode.Trim())
        {
            session.Attempts++;
            var remaining = 3 - session.Attempts;
            await SafeSetCacheStringAsync(sessionKey, JsonSerializer.Serialize(session), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });
            _logger.LogWarning("[AUTH AUDIT] MFA_OTP_MISMATCH: Email={Email}, Remaining={Remaining}", session.Email, remaining);
            return ServiceResult<AuthResponseDto>.Fail($"Mã xác thực OTP không chính xác. Bạn còn {remaining} lần thử.", 400);
        }

        // Correct OTP -> complete login
        await SafeRemoveCacheAsync(sessionKey);

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

    public async Task<ServiceResult<object>> ForgotPasswordAsync(ForgotPasswordDto dto, string clientIp = "127.0.0.1")
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return ServiceResult<object>.Fail("Vui lòng nhập địa chỉ email.", 400);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var safeIp = string.IsNullOrWhiteSpace(clientIp) ? "127.0.0.1" : clientIp.Trim();

        // 1. Rate limiting: 60s cooldown per email
        var cooldownKey = $"pwd_otp_cooldown_{normalizedEmail}";
        if (!string.IsNullOrEmpty(await SafeGetCacheStringAsync(cooldownKey)))
        {
            return ServiceResult<object>.Fail("Vui lòng đợi 60 giây trước khi yêu cầu mã mới.", 429);
        }

        // 2. Rate limiting: max 5 requests per 15 minutes per email
        var emailCountKey = $"pwd_otp_count_{normalizedEmail}";
        var emailCountStr = await SafeGetCacheStringAsync(emailCountKey);
        int.TryParse(emailCountStr, out var emailCount);
        if (emailCount >= 5)
        {
            return ServiceResult<object>.Fail("Bạn đã vượt quá số lần yêu cầu mã OTP (tối đa 5 lần trong 15 phút). Vui lòng thử lại sau.", 429);
        }

        // 3. Rate limiting: max 10 requests per 15 minutes per IP
        var ipCountKey = $"pwd_otp_ip_{safeIp}";
        var ipCountStr = await SafeGetCacheStringAsync(ipCountKey);
        int.TryParse(ipCountStr, out var ipCount);
        if (ipCount >= 10)
        {
            return ServiceResult<object>.Fail("Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.", 429);
        }

        // Update rate limits in cache
        await SafeSetCacheStringAsync(cooldownKey, "1", new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60)
        });

        await SafeSetCacheStringAsync(emailCountKey, (emailCount + 1).ToString(), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
        });

        await SafeSetCacheStringAsync(ipCountKey, (ipCount + 1).ToString(), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
        });

        // 4. Check if account exists
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user != null)
        {
            // Invalidate any previous OTP for the same account
            await SafeRemoveCacheAsync($"password-reset:{user.Id}");
            await SafeRemoveCacheAsync($"password-reset:email:{normalizedEmail}");

            // Generate cryptographically secure 6-digit OTP
            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
            var otpHash = HashSha256Hex(otp);

            var otpData = new PasswordResetOtpData
            {
                UserId = user.Id,
                Email = user.Email,
                OtpHash = otpHash,
                Attempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            var entryOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            };

            await SafeSetCacheStringAsync($"password-reset:{user.Id}", JsonSerializer.Serialize(otpData), entryOptions);
            await SafeSetCacheStringAsync($"password-reset:email:{normalizedEmail}", user.Id.ToString(), entryOptions);

            _logger.LogInformation("[AUTH AUDIT] PASSWORD_RESET_OTP_ISSUED: Email={MaskedEmail}, IP={ClientIp}",
                MaskEmail(user.Email), safeIp);

            // 1. Direct delivery via EmailService
            if (_emailService != null)
            {
                try
                {
                    await _emailService.SendPasswordResetOtpAsync(user.Email, otp);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[AuthService] Failed to send password reset email to {MaskedEmail}", MaskEmail(user.Email));
                }
            }

            // 2. Publish audit event to Kafka asynchronously if available
            if (_kafkaProducer != null)
            {
                try
                {
                    await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Title = "Mã xác thực đặt lại mật khẩu",
                        Message = $"Mã xác thực của bạn là: {otp} (có hiệu lực trong 5 phút).",
                        Type = "Security",
                        EventType = "PasswordResetOtp",
                        CreatedAt = DateTime.UtcNow,
                        Metadata = new System.Collections.Generic.Dictionary<string, object?>
                        {
                            ["Email"] = user.Email,
                            ["Otp"] = otp
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "[AuthService] Optional Kafka notification skipped.");
                }
            }
        }
        else
        {
            _logger.LogInformation("[AUTH AUDIT] PASSWORD_RESET_NONEXISTENT_EMAIL: Email={MaskedEmail}, IP={ClientIp}",
                MaskEmail(normalizedEmail), safeIp);
        }

        // Generic response regardless of whether email exists to prevent user enumeration
        return ServiceResult<object>.Ok(new 
        { 
            message = "If the account exists, an OTP has been sent."
        });
    }

    public async Task<ServiceResult<VerifyOtpResponseDto>> VerifyOtpAsync(VerifyOtpDto dto, string clientIp = "127.0.0.1")
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Otp))
        {
            return ServiceResult<VerifyOtpResponseDto>.Fail("Vui lòng nhập email và mã OTP.", 400);
        }

        var trimmedOtp = dto.Otp.Trim();
        if (!System.Text.RegularExpressions.Regex.IsMatch(trimmedOtp, @"^\d{6}$"))
        {
            return ServiceResult<VerifyOtpResponseDto>.Fail("Mã OTP phải gồm 6 chữ số.", 400);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        // Find userId from email index in cache or fallback to database
        var userIdStr = await SafeGetCacheStringAsync($"password-reset:email:{normalizedEmail}");
        Guid userId = Guid.Empty;
        if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var parsedGuid))
        {
            userId = parsedGuid;
        }
        else
        {
            var userInDb = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (userInDb != null)
            {
                userId = userInDb.Id;
            }
        }

        if (userId == Guid.Empty)
        {
            return ServiceResult<VerifyOtpResponseDto>.Fail("Mã OTP không hợp lệ hoặc đã hết hạn.", 400);
        }

        var otpCacheKey = $"password-reset:{userId}";
        var cachedOtpJson = await SafeGetCacheStringAsync(otpCacheKey);
        if (string.IsNullOrEmpty(cachedOtpJson))
        {
            return ServiceResult<VerifyOtpResponseDto>.Fail("Mã OTP không hợp lệ hoặc đã hết hạn.", 400);
        }

        PasswordResetOtpData? otpData = null;
        try
        {
            otpData = JsonSerializer.Deserialize<PasswordResetOtpData>(cachedOtpJson);
        }
        catch
        {
            // invalid json
        }

        if (otpData == null)
        {
            return ServiceResult<VerifyOtpResponseDto>.Fail("Mã OTP không hợp lệ hoặc đã hết hạn.", 400);
        }

        // Lockout check: max 5 failed attempts
        if (otpData.Attempts >= 5)
        {
            await SafeRemoveCacheAsync(otpCacheKey);
            await SafeRemoveCacheAsync($"password-reset:email:{normalizedEmail}");
            _logger.LogWarning("[AUTH AUDIT] OTP_MAX_ATTEMPTS_EXCEEDED: UserId={UserId}, Email={MaskedEmail}", userId, MaskEmail(normalizedEmail));
            return ServiceResult<VerifyOtpResponseDto>.Fail("Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị vô hiệu hóa, vui lòng yêu cầu mã mới.", 400);
        }

        // Constant-time comparison of OTP hash
        var inputHash = HashSha256Hex(trimmedOtp);
        var isValid = SlowEqualsHex(inputHash, otpData.OtpHash);

        if (!isValid)
        {
            otpData.Attempts++;
            if (otpData.Attempts >= 5)
            {
                await SafeRemoveCacheAsync(otpCacheKey);
                await SafeRemoveCacheAsync($"password-reset:email:{normalizedEmail}");
                _logger.LogWarning("[AUTH AUDIT] OTP_LOCKOUT_TRIGGERED: UserId={UserId}, Email={MaskedEmail}", userId, MaskEmail(normalizedEmail));
                return ServiceResult<VerifyOtpResponseDto>.Fail("Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị vô hiệu hóa, vui lòng yêu cầu mã mới.", 400);
            }

            // Update remaining attempts in cache with 5-min TTL
            await SafeSetCacheStringAsync(otpCacheKey, JsonSerializer.Serialize(otpData), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });

            var remaining = 5 - otpData.Attempts;
            return ServiceResult<VerifyOtpResponseDto>.Fail($"Mã OTP không chính xác. Bạn còn {remaining} lần thử.", 400);
        }

        // Success: immediately invalidate OTP (single-use)
        await SafeRemoveCacheAsync(otpCacheKey);
        await SafeRemoveCacheAsync($"password-reset:email:{normalizedEmail}");

        // Generate cryptographically secure random reset token (32 bytes)
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var resetToken = Convert.ToHexString(tokenBytes).ToLowerInvariant();
        var resetTokenHash = HashSha256Hex(resetToken);

        var tokenData = new PasswordResetTokenData
        {
            UserId = userId,
            Email = normalizedEmail,
            CreatedAt = DateTime.UtcNow
        };

        // Store resetToken hash in Redis with 10-minute TTL
        await SafeSetCacheStringAsync($"password-reset-token:{resetTokenHash}", JsonSerializer.Serialize(tokenData), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        });

        _logger.LogInformation("[AUTH AUDIT] OTP_VERIFIED_SUCCESS: UserId={UserId}, Email={MaskedEmail}", userId, MaskEmail(normalizedEmail));

        return ServiceResult<VerifyOtpResponseDto>.Ok(new VerifyOtpResponseDto
        {
            ResetToken = resetToken,
            Message = "Xác thực OTP thành công. Vui lòng đặt mật khẩu mới trong vòng 10 phút."
        });
    }

    public async Task<ServiceResult<object>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var token = dto.GetEffectiveToken();
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return ServiceResult<object>.Fail("Vui lòng cung cấp mã xác thực đặt lại mật khẩu và mật khẩu mới.", 400);
        }

        if (dto.NewPassword.Length < 6)
        {
            return ServiceResult<object>.Fail("Mật khẩu mới phải có độ dài từ 6 ký tự trở lên.", 400);
        }

        Guid userId = Guid.Empty;
        string? userEmail = null;

        // 1. Try lookup by resetToken hash in Redis
        var tokenHash = HashSha256Hex(token);
        var tokenCacheKey = $"password-reset-token:{tokenHash}";
        var cachedTokenJson = await SafeGetCacheStringAsync(tokenCacheKey);

        if (!string.IsNullOrEmpty(cachedTokenJson))
        {
            try
            {
                var tokenData = JsonSerializer.Deserialize<PasswordResetTokenData>(cachedTokenJson);
                if (tokenData != null)
                {
                    userId = tokenData.UserId;
                    userEmail = tokenData.Email;
                }
            }
            catch
            {
                // ignore
            }

            // Single-use: immediately consume and invalidate token
            await SafeRemoveCacheAsync(tokenCacheKey);
        }
        else
        {
            // Backward-compatibility: Check legacy pwd_reset_{email}
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var legacyEmail = dto.Email.Trim().ToLowerInvariant();
                var legacyCachedToken = await SafeGetCacheStringAsync($"pwd_reset_{legacyEmail}");
                if (!string.IsNullOrEmpty(legacyCachedToken) && SlowEquals(legacyCachedToken, token))
                {
                    await SafeRemoveCacheAsync($"pwd_reset_{legacyEmail}");
                    userEmail = legacyEmail;
                }
            }
        }

        if (userId == Guid.Empty && string.IsNullOrEmpty(userEmail))
        {
            return ServiceResult<object>.Fail("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.", 400);
        }

        User? user = null;
        if (userId != Guid.Empty)
        {
            user = await _db.Users.FindAsync(userId);
        }
        else if (!string.IsNullOrEmpty(userEmail))
        {
            user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail);
        }

        if (user == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy tài khoản tương ứng.");
        }

        // Hash new password using ASP.NET Core PasswordHasher
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        await _db.SaveChangesAsync();

        // Invalidate any residual OTP keys or legacy keys
        await SafeRemoveCacheAsync($"password-reset:{user.Id}");
        await SafeRemoveCacheAsync($"password-reset:email:{user.Email.ToLowerInvariant()}");
        await SafeRemoveCacheAsync($"pwd_reset_{user.Email.ToLowerInvariant()}");

        _logger.LogInformation("[AUTH AUDIT] PASSWORD_RESET_COMPLETED: UserId={UserId}, Email={MaskedEmail}", user.Id, MaskEmail(user.Email));

        return ServiceResult<object>.Ok(new 
        { 
            message = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới." 
        });
    }

    public async Task<ServiceResult<object>> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return ServiceResult<object>.Fail("Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.", 400);
        }

        if (dto.NewPassword.Length < 6)
        {
            return ServiceResult<object>.Fail("Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ServiceResult<object>.NotFound("Không tìm thấy thông tin tài khoản.");
        }

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            return ServiceResult<object>.Fail("Mật khẩu hiện tại không chính xác.", 400);
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        await _db.SaveChangesAsync();

        _logger.LogInformation("[AUTH AUDIT] PASSWORD_CHANGED: UserId={UserId}", userId);
        return ServiceResult<object>.Ok(new { message = "Đổi mật khẩu thành công!" });
    }
}
