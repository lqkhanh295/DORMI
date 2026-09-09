using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DormiDbContext _db;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IMemoryCache _cache;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthController(DormiDbContext db, IJwtTokenGenerator tokenGenerator, IMemoryCache cache)
    {
        _db = db;
        _tokenGenerator = tokenGenerator;
        _cache = cache;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
        {
            return BadRequest(new { message = "Email đã tồn tại trong hệ thống." });
        }

        // ponytail: Disallow self-registration of Admin role. Only Customer or Landlord allowed publicly.
        if (dto.Role == UserRole.Admin || !Enum.IsDefined(typeof(UserRole), dto.Role))
        {
            return BadRequest(new { message = "Không được phép tự tạo tài khoản Quản trị viên." });
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

        return Ok(new AuthResponseDto
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        var token = _tokenGenerator.GenerateToken(user);

        return Ok(new AuthResponseDto
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

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest(new { message = "Vui lòng nhập địa chỉ email." });
        }

        var normalizedEmail = dto.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản với địa chỉ email này." });
        }

        // Generate a secure 6-digit OTP reset token with 15-minute expiration
        var resetToken = Random.Shared.Next(100000, 999999).ToString();
        _cache.Set($"pwd_reset_{normalizedEmail}", resetToken, TimeSpan.FromMinutes(15));

        return Ok(new 
        { 
            message = "Mã xác thực đặt lại mật khẩu đã được tạo (hiệu lực trong 15 phút).",
            resetToken = resetToken 
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { message = "Vui lòng cung cấp đầy đủ email, mã xác thực và mật khẩu mới." });
        }

        if (dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu mới phải có độ dài từ 6 ký tự trở lên." });
        }

        var normalizedEmail = dto.Email.Trim().ToLower();
        if (!_cache.TryGetValue($"pwd_reset_{normalizedEmail}", out string? cachedToken) || cachedToken != dto.Token.Trim())
        {
            return BadRequest(new { message = "Mã xác thực đặt lại mật khẩu không chính xác hoặc đã hết hạn." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản tương ứng với email này." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        await _db.SaveChangesAsync();
        _cache.Remove($"pwd_reset_{normalizedEmail}");

        return Ok(new { message = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới." });
    }
}
