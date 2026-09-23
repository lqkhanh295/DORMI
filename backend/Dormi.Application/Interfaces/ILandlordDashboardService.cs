using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface ILandlordDashboardService
{
    Task<ServiceResult<LandlordAnalyticsDto>> GetAnalyticsAsync(Guid landlordId);
    Task<ServiceResult<RealLeadAnalyticsDto>> GetLeadAnalyticsAsync(Guid landlordId, Guid? roomId);
    Task<ServiceResult<List<PaymentTransactionDto>>> GetBillingHistoryAsync(Guid landlordId);
    Task<ServiceResult<object>> CheckoutSubscriptionAsync(Guid landlordId, CheckoutDto dto, string clientIp);
    Task<ServiceResult<object>> GetPaymentStatusAsync(Guid landlordId, string transactionRef);
    Task<ServiceResult<object>> SimulateGatewayPaymentAsync(Guid landlordId, PaymentVerifyDto dto);
    Task<ServiceResult<object>> VerifyPaymentAsync(Guid landlordId, PaymentVerifyDto dto);
    Task<ServiceResult<string>> ProcessVnpayReturnAsync(IDictionary<string, string> queryParams, string vnp_TxnRef, string vnp_ResponseCode, string vnp_SecureHash);
    Task<ServiceResult<List<TenantDiscoveryDto>>> DiscoverTenantsAsync(Guid landlordId);
}
