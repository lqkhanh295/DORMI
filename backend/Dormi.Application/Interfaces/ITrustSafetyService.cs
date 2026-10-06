using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

// ponytail: Trust & Safety interface providing transparent trust scores, property validation, and moderation queue
public interface ITrustSafetyService
{
    Task<ServiceResult<TrustScoreBreakdownDto>> CalculateTrustScoreAsync(Guid roomId);
    Task<ServiceResult<object>> SubmitPropertyVerificationAsync(Guid landlordId, SubmitPropertyVerificationDto dto);
    Task<ServiceResult<List<ModerationReportDto>>> GetModerationQueueAsync(string? status, string? riskLevel);
    Task<ServiceResult<object>> ResolveReportAsync(Guid reportId, Guid moderatorId, string moderatorEmail, ResolveReportDto dto);
    Task<ServiceResult<List<AuditLogDto>>> GetAuditLogsAsync(int limit = 50);
}
