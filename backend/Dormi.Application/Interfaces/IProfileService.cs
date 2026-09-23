using System;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IProfileService
{
    Task<ServiceResult<CustomerProfileDto>> GetCustomerProfileAsync(Guid userId);
    Task<ServiceResult<object>> UpdateCustomerProfileAsync(Guid userId, CustomerProfileDto dto);
    Task<ServiceResult<LandlordProfileDto>> GetLandlordProfileAsync(Guid userId);
    Task<ServiceResult<object>> UpdateLandlordProfileAsync(Guid userId, LandlordProfileDto dto);
    Task<ServiceResult<object>> SubmitLandlordVerificationAsync(Guid userId, SubmitVerificationDto dto);
    Task<ServiceResult<object>> GetLandlordVerificationAsync(Guid userId);
}
