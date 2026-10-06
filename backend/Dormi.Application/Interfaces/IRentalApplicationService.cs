using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Domain.Enums;

namespace Dormi.Application.Interfaces;

public interface IRentalApplicationService
{
    Task<ServiceResult<RentalApplicationResponseDto>> CreateApplicationAsync(Guid tenantId, CreateApplicationDto dto);
    Task<ServiceResult<List<RentalApplicationResponseDto>>> GetTenantApplicationsAsync(Guid tenantId);
    Task<ServiceResult<List<RentalApplicationResponseDto>>> GetLandlordApplicationsAsync(Guid landlordId, ApplicationStatus? status = null);
    Task<ServiceResult<RentalApplicationResponseDto>> GetApplicationByIdAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<ServiceResult<object>> ReviewApplicationAsync(Guid id, Guid landlordId, ReviewApplicationDto dto);
    Task<ServiceResult<object>> WithdrawApplicationAsync(Guid id, Guid tenantId);
}
