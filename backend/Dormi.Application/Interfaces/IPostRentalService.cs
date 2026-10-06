using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

// ponytail: Post-rental lifecycle interface managing payments, maintenance, renewal, and move-out checkout
public interface IPostRentalService
{
    // Payment schedules (Rail A: Tenant -> Landlord)
    Task<ServiceResult<List<RentalPaymentScheduleDto>>> GetPaymentSchedulesAsync(Guid leaseId, Guid userId);
    Task<ServiceResult<RentalPaymentScheduleDto>> CreatePaymentScheduleAsync(CreatePaymentScheduleDto dto, Guid landlordId);
    Task<ServiceResult<RentalPaymentScheduleDto>> RecordPaymentAsync(Guid scheduleId, RecordPaymentDto dto, Guid userId);

    // Maintenance ticketing
    Task<ServiceResult<MaintenanceRequestDto>> CreateMaintenanceRequestAsync(CreateMaintenanceRequestDto dto, Guid tenantId);
    Task<ServiceResult<List<MaintenanceRequestDto>>> GetMaintenanceRequestsAsync(Guid? leaseId, Guid userId, bool isLandlord);
    Task<ServiceResult<MaintenanceRequestDto>> GetMaintenanceRequestByIdAsync(Guid id, Guid userId);
    Task<ServiceResult<MaintenanceRequestDto>> UpdateMaintenanceStatusAsync(Guid id, UpdateMaintenanceStatusDto dto, Guid landlordId);
    Task<ServiceResult<MaintenanceRequestDto>> ConfirmMaintenanceResolutionAsync(Guid id, ConfirmMaintenanceResolutionDto dto, Guid tenantId);

    // Post-rental summary (Next payment, active maintenance, moveout/renewal badges)
    Task<ServiceResult<PostRentalSummaryDto>> GetPostRentalSummaryAsync(Guid leaseId, Guid userId);

    // Renewal
    Task<ServiceResult<LeaseContractResponseDto>> RequestRenewalAsync(Guid leaseId, RequestRenewalDto dto, Guid userId);
    Task<ServiceResult<LeaseContractResponseDto>> RespondRenewalAsync(Guid leaseId, RespondRenewalDto dto, Guid userId);

    // Move-out & deposit settlement
    Task<ServiceResult<LeaseContractResponseDto>> RequestMoveOutAsync(Guid leaseId, RequestMoveOutDto dto, Guid userId);
    Task<ServiceResult<LeaseContractResponseDto>> CompleteMoveOutInspectionAsync(Guid leaseId, MoveOutInspectionDto dto, Guid landlordId);
}
