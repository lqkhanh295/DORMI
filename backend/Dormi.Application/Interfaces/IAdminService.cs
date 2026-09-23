using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Domain.Enums;

namespace Dormi.Application.Interfaces;

public interface IAdminService
{
    Task<ServiceResult<AdminStatsDto>> GetStatsAsync();
    Task<ServiceResult<List<UserModerationDto>>> GetUsersAsync(UserRole? role);
    Task<ServiceResult<object>> GetPendingVerificationsAsync();
    Task<ServiceResult<object>> UpdateVerificationStatusAsync(Guid id, ReviewVerificationDto dto);
    Task<ServiceResult<object>> GetRoomsForModerationAsync();
    Task<ServiceResult<object>> UpdateRoomStatusAsync(Guid roomId, RoomStatus status);
    Task<ServiceResult<object>> GetReportsAsync();
    Task<ServiceResult<object>> UpdateReportStatusAsync(Guid reportId, string status);
    Task<ServiceResult<object>> GetRoommatePostsForModerationAsync();
    Task<ServiceResult<object>> UpdateRoommatePostStatusAsync(Guid id, bool isActive);
}
