using System;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<ServiceResult<UserDto>> GetMeAsync(Guid userId);
    Task<ServiceResult<object>> ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<ServiceResult<object>> ResetPasswordAsync(ResetPasswordDto dto);
}
