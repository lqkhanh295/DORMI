using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface ITenantReviewService
{
    Task<ServiceResult<List<LeaseContractDto>>> GetMyLeasesAsync(Guid userId);
    Task<ServiceResult<object>> RateTenantAsync(Guid landlordId, CreateTenantReviewDto dto);
    Task<ServiceResult<object>> GetTenantReputationAsync(Guid tenantId);
}
