using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface ILeaseService
{
    Task<ServiceResult<LeaseContractResponseDto>> CreateLeaseAsync(Guid landlordId, CreateLeaseDto dto);
    Task<ServiceResult<List<LeaseContractResponseDto>>> GetMyLeasesAsync(Guid userId);
    Task<ServiceResult<LeaseContractResponseDto>> GetLeaseByIdAsync(Guid leaseId, Guid userId, bool isAdmin);
    Task<ServiceResult<LeaseContractResponseDto>> SignLeaseByTenantAsync(Guid leaseId, Guid tenantId, SignLeaseDto dto);
    Task<ServiceResult<LeaseContractResponseDto>> TerminateLeaseAsync(Guid leaseId, Guid userId, bool isAdmin, TerminateLeaseDto dto);
}
