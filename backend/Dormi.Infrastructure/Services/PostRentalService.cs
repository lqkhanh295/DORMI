using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;

namespace Dormi.Infrastructure.Services;

// ponytail: PostRentalService manages the post-lease operational lifecycle:
// Rail A Payments (Tenant -> Landlord), Maintenance Ticketing, Renewal & Move-Out Checkout with Deposit Settlement.
public class PostRentalService : IPostRentalService
{
    private readonly DormiDbContext _db;
    private readonly IKafkaProducer? _kafkaProducer;
    private readonly IDistributedLockService? _lockService;

    public PostRentalService(DormiDbContext db, IKafkaProducer? kafkaProducer = null, IDistributedLockService? lockService = null)
    {
        _db = db;
        _kafkaProducer = kafkaProducer;
        _lockService = lockService;
    }

    // =========================================================================
    // 1. PAYMENT SCHEDULES (RAIL A: TENANT -> LANDLORD)
    // =========================================================================

    public async Task<ServiceResult<List<RentalPaymentScheduleDto>>> GetPaymentSchedulesAsync(Guid leaseId, Guid userId)
    {
        var lease = await _db.LeaseContracts.FindAsync(leaseId);
        if (lease == null) return ServiceResult<List<RentalPaymentScheduleDto>>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != userId && lease.TenantId != userId) return ServiceResult<List<RentalPaymentScheduleDto>>.Forbidden();

        var schedules = await _db.RentalPaymentSchedules
            .Where(s => s.LeaseContractId == leaseId)
            .OrderBy(s => s.DueDate)
            .Select(s => new RentalPaymentScheduleDto
            {
                Id = s.Id,
                LeaseContractId = s.LeaseContractId,
                Type = s.Type,
                Title = s.Title,
                Amount = s.Amount,
                DueDate = s.DueDate,
                Status = s.Status,
                PaidAt = s.PaidAt,
                PaymentReference = s.PaymentReference,
                PaymentMethod = s.PaymentMethod,
                LandlordNotes = s.LandlordNotes,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        return ServiceResult<List<RentalPaymentScheduleDto>>.Ok(schedules);
    }

    public async Task<ServiceResult<RentalPaymentScheduleDto>> CreatePaymentScheduleAsync(CreatePaymentScheduleDto dto, Guid landlordId)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Tenant)
            .Include(l => l.Room)
            .FirstOrDefaultAsync(l => l.Id == dto.LeaseContractId);

        if (lease == null) return ServiceResult<RentalPaymentScheduleDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != landlordId) return ServiceResult<RentalPaymentScheduleDto>.Forbidden();

        var schedule = new RentalPaymentSchedule
        {
            Id = Guid.NewGuid(),
            LeaseContractId = lease.Id,
            Type = dto.Type,
            Title = dto.Title,
            Amount = dto.Amount,
            DueDate = dto.DueDate,
            Status = "Pending",
            LandlordNotes = dto.LandlordNotes,
            CreatedAt = DateTime.UtcNow
        };

        _db.RentalPaymentSchedules.Add(schedule);
        await _db.SaveChangesAsync();

        // Notify tenant
        await SendNotificationAsync(
            lease.TenantId,
            $"Hóa đơn thanh toán mới: {schedule.Title}",
            $"Chủ nhà đã tạo hóa đơn '{schedule.Title}' số tiền {schedule.Amount:N0}đ, hạn thanh toán {schedule.DueDate:dd/MM/yyyy}.",
            "Payment",
            "/tenant/leases"
        );

        return ServiceResult<RentalPaymentScheduleDto>.Ok(new RentalPaymentScheduleDto
        {
            Id = schedule.Id,
            LeaseContractId = schedule.LeaseContractId,
            Type = schedule.Type,
            Title = schedule.Title,
            Amount = schedule.Amount,
            DueDate = schedule.DueDate,
            Status = schedule.Status,
            LandlordNotes = schedule.LandlordNotes,
            CreatedAt = schedule.CreatedAt
        });
    }

    public async Task<ServiceResult<RentalPaymentScheduleDto>> RecordPaymentAsync(Guid scheduleId, RecordPaymentDto dto, Guid userId)
    {
        var schedule = await _db.RentalPaymentSchedules
            .Include(s => s.LeaseContract)
                .ThenInclude(l => l.Tenant)
            .Include(s => s.LeaseContract)
                .ThenInclude(l => l.Landlord)
            .FirstOrDefaultAsync(s => s.Id == scheduleId);

        if (schedule == null) return ServiceResult<RentalPaymentScheduleDto>.NotFound("Không tìm thấy đợt thanh toán.");
        var lease = schedule.LeaseContract;
        if (lease.LandlordId != userId && lease.TenantId != userId) return ServiceResult<RentalPaymentScheduleDto>.Forbidden();

        // ponytail: Distributed lock protects concurrent double payment marking
        var lockKey = $"confirm_payment:{scheduleId}";
        if (_lockService != null)
        {
            var acquired = await _lockService.TryAcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
            if (!acquired)
            {
                return ServiceResult<RentalPaymentScheduleDto>.Fail("Yêu cầu xác nhận thanh toán đang được xử lý, vui lòng chờ trong giây lát.", 409);
            }
        }

        try
        {
            schedule.PaymentMethod = dto.PaymentMethod ?? schedule.PaymentMethod;
            schedule.PaymentReference = dto.PaymentReference ?? schedule.PaymentReference;
            if (!string.IsNullOrWhiteSpace(dto.LandlordNotes)) schedule.LandlordNotes = dto.LandlordNotes;

            if (dto.MarkAsPaid)
            {
                schedule.Status = "Paid";
                schedule.PaidAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            var targetUserId = userId == lease.LandlordId ? lease.TenantId : lease.LandlordId;
            var senderRole = userId == lease.LandlordId ? "Chủ nhà" : "Khách thuê";
            var eventType = dto.MarkAsPaid ? "PaymentCompleted" : "PaymentUpdated";

            await SendNotificationAsync(
                targetUserId,
                $"Cập nhật thanh toán: {schedule.Title}",
                $"{senderRole} đã cập nhật trạng thái thanh toán hóa đơn '{schedule.Title}' ({schedule.Amount:N0}đ). Trạng thái: {schedule.Status}.",
                "Payment",
                userId == lease.LandlordId ? "/tenant/leases" : "/landlord/leases",
                eventType,
                new Dictionary<string, object?>
                {
                    ["paymentId"] = schedule.Id.ToString(),
                    ["leaseId"] = lease.Id.ToString(),
                    ["amount"] = schedule.Amount,
                    ["isPaid"] = dto.MarkAsPaid
                }
            );

            return ServiceResult<RentalPaymentScheduleDto>.Ok(new RentalPaymentScheduleDto
            {
                Id = schedule.Id,
                LeaseContractId = schedule.LeaseContractId,
                Type = schedule.Type,
                Title = schedule.Title,
                Amount = schedule.Amount,
                DueDate = schedule.DueDate,
                Status = schedule.Status,
                PaidAt = schedule.PaidAt,
                PaymentReference = schedule.PaymentReference,
                PaymentMethod = schedule.PaymentMethod,
                LandlordNotes = schedule.LandlordNotes,
                CreatedAt = schedule.CreatedAt
            });
        }
        finally
        {
            if (_lockService != null)
            {
                await _lockService.ReleaseLockAsync(lockKey);
            }
        }
    }

    // =========================================================================
    // 2. MAINTENANCE TICKETING SYSTEM
    // =========================================================================

    public async Task<ServiceResult<MaintenanceRequestDto>> CreateMaintenanceRequestAsync(CreateMaintenanceRequestDto dto, Guid tenantId)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Tenant)
            .Include(l => l.Landlord)
            .Include(l => l.Room)
            .FirstOrDefaultAsync(l => l.Id == dto.LeaseContractId);

        if (lease == null) return ServiceResult<MaintenanceRequestDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.TenantId != tenantId) return ServiceResult<MaintenanceRequestDto>.Forbidden();

        var req = new MaintenanceRequest
        {
            Id = Guid.NewGuid(),
            LeaseContractId = lease.Id,
            TenantId = tenantId,
            LandlordId = lease.LandlordId,
            RoomId = lease.RoomId,
            Title = dto.Title,
            Description = dto.Description,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category,
            Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "Medium" : dto.Priority,
            Status = "OPEN",
            ImageUrls = dto.ImageUrls,
            CreatedAt = DateTime.UtcNow
        };

        _db.MaintenanceRequests.Add(req);
        await _db.SaveChangesAsync();

        await SendNotificationAsync(
            lease.LandlordId,
            $"Yêu cầu sửa chữa mới: {req.Title}",
            $"Khách thuê {lease.Tenant.FullName} vừa gửi yêu cầu sửa chữa cho phòng '{lease.Room.Title}'. Mức độ: {req.Priority}.",
            "Maintenance",
            "/landlord/leases",
            "MaintenanceCreated",
            new Dictionary<string, object?>
            {
                ["ticketId"] = req.Id.ToString(),
                ["leaseId"] = lease.Id.ToString(),
                ["priority"] = req.Priority
            }
        );

        return ServiceResult<MaintenanceRequestDto>.Ok(MapMaintenanceDto(req, lease.Tenant, lease.Landlord, lease.Room));
    }

    public async Task<ServiceResult<List<MaintenanceRequestDto>>> GetMaintenanceRequestsAsync(Guid? leaseId, Guid userId, bool isLandlord)
    {
        var query = _db.MaintenanceRequests
            .Include(m => m.Tenant)
            .Include(m => m.Landlord)
            .Include(m => m.Room)
            .AsQueryable();

        if (leaseId.HasValue)
        {
            query = query.Where(m => m.LeaseContractId == leaseId.Value);
        }

        if (isLandlord)
        {
            query = query.Where(m => m.LandlordId == userId);
        }
        else
        {
            query = query.Where(m => m.TenantId == userId);
        }

        var list = await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        var dtos = list.Select(m => MapMaintenanceDto(m, m.Tenant, m.Landlord, m.Room)).ToList();
        return ServiceResult<List<MaintenanceRequestDto>>.Ok(dtos);
    }

    public async Task<ServiceResult<MaintenanceRequestDto>> GetMaintenanceRequestByIdAsync(Guid id, Guid userId)
    {
        var m = await _db.MaintenanceRequests
            .Include(x => x.Tenant)
            .Include(x => x.Landlord)
            .Include(x => x.Room)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return ServiceResult<MaintenanceRequestDto>.NotFound("Không tìm thấy yêu cầu sửa chữa.");
        if (m.TenantId != userId && m.LandlordId != userId) return ServiceResult<MaintenanceRequestDto>.Forbidden();

        return ServiceResult<MaintenanceRequestDto>.Ok(MapMaintenanceDto(m, m.Tenant, m.Landlord, m.Room));
    }

    public async Task<ServiceResult<MaintenanceRequestDto>> UpdateMaintenanceStatusAsync(Guid id, UpdateMaintenanceStatusDto dto, Guid landlordId)
    {
        var m = await _db.MaintenanceRequests
            .Include(x => x.Tenant)
            .Include(x => x.Landlord)
            .Include(x => x.Room)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return ServiceResult<MaintenanceRequestDto>.NotFound("Không tìm thấy yêu cầu sửa chữa.");
        if (m.LandlordId != landlordId) return ServiceResult<MaintenanceRequestDto>.Forbidden();

        m.Status = dto.Status.ToUpper();
        if (!string.IsNullOrWhiteSpace(dto.AssignedTo)) m.AssignedTo = dto.AssignedTo;
        if (!string.IsNullOrWhiteSpace(dto.ResolutionNotes)) m.ResolutionNotes = dto.ResolutionNotes;
        if (dto.EstimatedCost.HasValue) m.EstimatedCost = dto.EstimatedCost;
        if (dto.ActualCost.HasValue) m.ActualCost = dto.ActualCost;

        if (m.Status == "RESOLVED")
        {
            m.ResolvedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        await SendNotificationAsync(
            m.TenantId,
            $"Cập nhật xử lý sự cố: {m.Title}",
            $"Chủ nhà đã cập nhật trạng thái yêu cầu sửa chữa '{m.Title}' sang '{m.Status}'.",
            "Maintenance",
            "/tenant/leases",
            "MaintenanceStatusUpdated",
            new Dictionary<string, object?>
            {
                ["ticketId"] = m.Id.ToString(),
                ["status"] = m.Status
            }
        );

        return ServiceResult<MaintenanceRequestDto>.Ok(MapMaintenanceDto(m, m.Tenant, m.Landlord, m.Room));
    }

    public async Task<ServiceResult<MaintenanceRequestDto>> ConfirmMaintenanceResolutionAsync(Guid id, ConfirmMaintenanceResolutionDto dto, Guid tenantId)
    {
        var m = await _db.MaintenanceRequests
            .Include(x => x.Tenant)
            .Include(x => x.Landlord)
            .Include(x => x.Room)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return ServiceResult<MaintenanceRequestDto>.NotFound("Không tìm thấy yêu cầu sửa chữa.");
        if (m.TenantId != tenantId) return ServiceResult<MaintenanceRequestDto>.Forbidden();

        m.TenantConfirmed = true;
        m.TenantFeedback = dto.TenantFeedback;
        m.TenantRating = dto.TenantRating ?? 5;
        m.Status = "CLOSED";
        m.ClosedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await SendNotificationAsync(
            m.LandlordId,
            $"Khách xác nhận đã sửa chữa xong: {m.Title}",
            $"Khách thuê {m.Tenant.FullName} đã xác nhận hoàn tất sửa chữa cho '{m.Title}' và đánh giá {m.TenantRating} sao.",
            "Maintenance",
            "/landlord/leases"
        );

        return ServiceResult<MaintenanceRequestDto>.Ok(MapMaintenanceDto(m, m.Tenant, m.Landlord, m.Room));
    }

    // =========================================================================
    // 3. POST-RENTAL SUMMARY (DASHBOARD WIDGETS)
    // =========================================================================

    public async Task<ServiceResult<PostRentalSummaryDto>> GetPostRentalSummaryAsync(Guid leaseId, Guid userId)
    {
        var lease = await _db.LeaseContracts.FindAsync(leaseId);
        if (lease == null) return ServiceResult<PostRentalSummaryDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != userId && lease.TenantId != userId) return ServiceResult<PostRentalSummaryDto>.Forbidden();

        var schedules = await _db.RentalPaymentSchedules
            .Where(s => s.LeaseContractId == leaseId)
            .ToListAsync();

        var pendingSchedules = schedules.Where(s => s.Status == "Pending" || s.Status == "Overdue").ToList();
        var nextPayment = pendingSchedules.OrderBy(s => s.DueDate).FirstOrDefault();

        var activeMaintenanceCount = await _db.MaintenanceRequests
            .CountAsync(m => m.LeaseContractId == leaseId && m.Status != "CLOSED");

        var summary = new PostRentalSummaryDto
        {
            LeaseId = lease.Id,
            LeaseStatus = lease.Status,
            StartDate = lease.StartDate,
            EndDate = lease.EndDate,
            MonthlyRent = lease.MonthlyRent,
            Deposit = lease.Deposit,
            NextPaymentAmount = nextPayment?.Amount,
            NextPaymentDueDate = nextPayment?.DueDate,
            PendingPaymentsCount = pendingSchedules.Count,
            ActiveMaintenanceCount = activeMaintenanceCount,
            IsRenewalRequested = lease.RenewalStatus == "Requested",
            IsMoveOutRequested = lease.MoveOutRequestedAt.HasValue && lease.Status != "Terminated"
        };

        return ServiceResult<PostRentalSummaryDto>.Ok(summary);
    }

    // =========================================================================
    // 4. RENEWAL
    // =========================================================================

    public async Task<ServiceResult<LeaseContractResponseDto>> RequestRenewalAsync(Guid leaseId, RequestRenewalDto dto, Guid userId)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room).ThenInclude(r => r.Images)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != userId && lease.TenantId != userId) return ServiceResult<LeaseContractResponseDto>.Forbidden();

        if (lease.Status != "Active" && lease.Status != "ExpiringSoon")
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Chỉ hợp đồng đang hoạt động mới có thể yêu cầu gia hạn.", 400);
        }

        lease.RenewalRequestedAt = DateTime.UtcNow;
        lease.RenewalProposedEndDate = dto.ProposedEndDate;
        lease.RenewalStatus = "Requested";

        await _db.SaveChangesAsync();

        var targetUserId = userId == lease.LandlordId ? lease.TenantId : lease.LandlordId;
        var requesterRole = userId == lease.LandlordId ? "Chủ nhà" : "Khách thuê";
        await SendNotificationAsync(
            targetUserId,
            $"Yêu cầu gia hạn hợp đồng thuê",
            $"{requesterRole} đã đề xuất gia hạn hợp đồng thuê phòng '{lease.Room.Title}' đến ngày {dto.ProposedEndDate:dd/MM/yyyy}.",
            "Lease",
            userId == lease.LandlordId ? "/tenant/leases" : "/landlord/leases"
        );

        return ServiceResult<LeaseContractResponseDto>.Ok(MapLeaseDto(lease));
    }

    public async Task<ServiceResult<LeaseContractResponseDto>> RespondRenewalAsync(Guid leaseId, RespondRenewalDto dto, Guid userId)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room).ThenInclude(r => r.Images)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != userId && lease.TenantId != userId) return ServiceResult<LeaseContractResponseDto>.Forbidden();

        if (dto.Accepted)
        {
            lease.RenewalStatus = "Accepted";
            var newEndDate = dto.CounterEndDate ?? lease.RenewalProposedEndDate ?? lease.EndDate.AddYears(1);
            lease.EndDate = newEndDate;
            lease.Status = "Active";

            await SendNotificationAsync(
                userId == lease.LandlordId ? lease.TenantId : lease.LandlordId,
                "Đã chấp thuận gia hạn hợp đồng",
                $"Hợp đồng thuê phòng '{lease.Room.Title}' đã được gia hạn thành công đến ngày {newEndDate:dd/MM/yyyy}.",
                "Lease",
                userId == lease.LandlordId ? "/tenant/leases" : "/landlord/leases"
            );
        }
        else
        {
            lease.RenewalStatus = "Declined";
            await SendNotificationAsync(
                userId == lease.LandlordId ? lease.TenantId : lease.LandlordId,
                "Từ chối gia hạn hợp đồng",
                $"Đề xuất gia hạn hợp đồng thuê phòng '{lease.Room.Title}' không được chấp thuận.",
                "Lease",
                userId == lease.LandlordId ? "/tenant/leases" : "/landlord/leases"
            );
        }

        await _db.SaveChangesAsync();
        return ServiceResult<LeaseContractResponseDto>.Ok(MapLeaseDto(lease));
    }

    // =========================================================================
    // 5. MOVE-OUT CHECKOUT & DEPOSIT SETTLEMENT
    // =========================================================================

    public async Task<ServiceResult<LeaseContractResponseDto>> RequestMoveOutAsync(Guid leaseId, RequestMoveOutDto dto, Guid userId)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room).ThenInclude(r => r.Images)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != userId && lease.TenantId != userId) return ServiceResult<LeaseContractResponseDto>.Forbidden();

        lease.MoveOutRequestedAt = DateTime.UtcNow;
        lease.MoveOutDate = dto.ProposedMoveOutDate;
        lease.MoveOutReason = dto.Reason;

        await _db.SaveChangesAsync();

        var targetUserId = userId == lease.LandlordId ? lease.TenantId : lease.LandlordId;
        var senderRole = userId == lease.LandlordId ? "Chủ nhà" : "Khách thuê";
        await SendNotificationAsync(
            targetUserId,
            "Thông báo kế hoạch trả phòng",
            $"{senderRole} đã thông báo kế hoạch trả phòng '{lease.Room.Title}' vào ngày {dto.ProposedMoveOutDate:dd/MM/yyyy}. Lý do: {dto.Reason}.",
            "Lease",
            userId == lease.LandlordId ? "/tenant/leases" : "/landlord/leases",
            "MoveOutRequested",
            new Dictionary<string, object?>
            {
                ["leaseId"] = lease.Id.ToString(),
                ["proposedDate"] = dto.ProposedMoveOutDate.ToString("o")
            }
        );

        return ServiceResult<LeaseContractResponseDto>.Ok(MapLeaseDto(lease));
    }

    public async Task<ServiceResult<LeaseContractResponseDto>> CompleteMoveOutInspectionAsync(Guid leaseId, MoveOutInspectionDto dto, Guid landlordId)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room).ThenInclude(r => r.Images)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.LandlordId != landlordId) return ServiceResult<LeaseContractResponseDto>.Forbidden();

        // ponytail: Distributed lock protects concurrent double checkout or double deposit settlement
        var lockKey = $"settle_deposit:{leaseId}";
        if (_lockService != null)
        {
            var acquired = await _lockService.TryAcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
            if (!acquired)
            {
                return ServiceResult<LeaseContractResponseDto>.Fail("Biên bản trả phòng và quyết toán cọc đang được xử lý đồng thời.", 409);
            }
        }

        try
        {
            lease.MoveOutInspectionNotes = dto.InspectionNotes;
            lease.MoveOutDeductions = dto.DeductionsAmount;
            lease.MoveOutDeductionReason = dto.DeductionReason;
            var settledDeposit = Math.Max(0, lease.Deposit - dto.DeductionsAmount);
            lease.MoveOutSettledDeposit = settledDeposit;
            lease.MoveOutSettledAt = DateTime.UtcNow;

            if (dto.ConfirmCheckout)
            {
                lease.Status = "Terminated";
                lease.TerminatedAt = DateTime.UtcNow;
                lease.TerminationReason = $"Hoàn tất thủ tục trả phòng và quyết toán cọc. Khấu trừ: {dto.DeductionsAmount:N0}đ. Hoàn cọc: {settledDeposit:N0}đ.";

                // ponytail: Inventory Re-synchronization: room returns to Available (0) so it can accept new tenants
                var room = await _db.Rooms.FindAsync(lease.RoomId);
                if (room != null)
                {
                    room.Status = RoomStatus.Available;
                }

                // Create record for deposit settlement in payment schedule
                _db.RentalPaymentSchedules.Add(new RentalPaymentSchedule
                {
                    Id = Guid.NewGuid(),
                    LeaseContractId = lease.Id,
                    Type = "MoveOutSettlement",
                    Title = $"Quyết toán hoàn tiền cọc ({lease.Room.Title})",
                    Amount = settledDeposit,
                    DueDate = DateTime.UtcNow,
                    Status = "Paid",
                    PaidAt = DateTime.UtcNow,
                    PaymentMethod = "BankTransfer",
                    LandlordNotes = $"Khấu trừ hư hại: {dto.DeductionsAmount:N0}đ ({dto.DeductionReason}). Số tiền thực hoàn: {settledDeposit:N0}đ.",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();

            await SendNotificationAsync(
                lease.TenantId,
                "Kết quả kiểm tra trả phòng & quyết toán cọc",
                $"Chủ nhà đã hoàn tất biên bản kiểm tra phòng '{lease.Room.Title}'. Tiền cọc được hoàn lại: {settledDeposit:N0}đ.",
                "Lease",
                "/tenant/leases",
                "MoveOutSettled",
                new Dictionary<string, object?>
                {
                    ["leaseId"] = lease.Id.ToString(),
                    ["refundAmount"] = settledDeposit,
                    ["deductions"] = dto.DeductionsAmount
                }
            );

            return ServiceResult<LeaseContractResponseDto>.Ok(MapLeaseDto(lease));
        }
        finally
        {
            if (_lockService != null)
            {
                await _lockService.ReleaseLockAsync(lockKey);
            }
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private async Task SendNotificationAsync(Guid userId, string title, string message, string type, string linkUrl, string? eventType = null, Dictionary<string, object?>? metadata = null)
    {
        var notif = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            LinkUrl = linkUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        _db.Notifications.Add(notif);

        if (_kafkaProducer != null)
        {
            try
            {
                await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
                {
                    Id = notif.Id,
                    EventType = eventType ?? $"{type}Event",
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    LinkUrl = linkUrl,
                    CreatedAt = DateTime.UtcNow,
                    Metadata = metadata
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Kafka Notification Notice]: {ex.Message}");
            }
        }
    }

    private static MaintenanceRequestDto MapMaintenanceDto(MaintenanceRequest m, User tenant, User landlord, Room room)
    {
        return new MaintenanceRequestDto
        {
            Id = m.Id,
            LeaseContractId = m.LeaseContractId,
            TenantId = m.TenantId,
            TenantName = tenant?.FullName ?? string.Empty,
            LandlordId = m.LandlordId,
            LandlordName = landlord?.FullName ?? string.Empty,
            RoomId = m.RoomId,
            RoomTitle = room?.Title ?? string.Empty,
            Title = m.Title,
            Description = m.Description,
            Category = m.Category,
            Priority = m.Priority,
            Status = m.Status,
            ImageUrls = m.ImageUrls,
            AssignedTo = m.AssignedTo,
            ResolutionNotes = m.ResolutionNotes,
            EstimatedCost = m.EstimatedCost,
            ActualCost = m.ActualCost,
            TenantConfirmed = m.TenantConfirmed,
            TenantFeedback = m.TenantFeedback,
            TenantRating = m.TenantRating,
            CreatedAt = m.CreatedAt,
            ResolvedAt = m.ResolvedAt,
            ClosedAt = m.ClosedAt
        };
    }

    private static LeaseContractResponseDto MapLeaseDto(LeaseContract lease)
    {
        return new LeaseContractResponseDto
        {
            Id = lease.Id,
            RentalApplicationId = lease.RentalApplicationId,
            RoomId = lease.RoomId,
            RoomTitle = lease.Room?.Title ?? string.Empty,
            RoomAddress = lease.Room?.Address ?? string.Empty,
            RoomImageUrl = lease.Room?.Images?.OrderByDescending(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
            LandlordId = lease.LandlordId,
            LandlordName = lease.Landlord?.FullName ?? string.Empty,
            LandlordPhone = lease.Landlord?.PhoneNumber,
            LandlordEmail = lease.Landlord?.Email ?? string.Empty,
            TenantId = lease.TenantId,
            TenantName = lease.Tenant?.FullName ?? string.Empty,
            TenantPhone = lease.Tenant?.PhoneNumber,
            TenantEmail = lease.Tenant?.Email ?? string.Empty,
            StartDate = lease.StartDate,
            EndDate = lease.EndDate,
            MonthlyRent = lease.MonthlyRent,
            Deposit = lease.Deposit,
            UtilitiesDescription = lease.UtilitiesDescription,
            TermsAndConditions = lease.TermsAndConditions,
            PaymentCycleMonths = lease.PaymentCycleMonths,
            Status = lease.Status,
            LandlordSigned = lease.LandlordSigned,
            LandlordSignedAt = lease.LandlordSignedAt,
            TenantSigned = lease.TenantSigned,
            TenantSignedAt = lease.TenantSignedAt,
            TenantSignatureData = lease.TenantSignatureData,
            ContractDocumentUrl = lease.ContractDocumentUrl,
            CreatedAt = lease.CreatedAt,
            ActivatedAt = lease.ActivatedAt,
            TerminatedAt = lease.TerminatedAt,
            TerminationReason = lease.TerminationReason,
            MoveOutRequestedAt = lease.MoveOutRequestedAt,
            MoveOutDate = lease.MoveOutDate,
            MoveOutReason = lease.MoveOutReason,
            MoveOutInspectionNotes = lease.MoveOutInspectionNotes,
            MoveOutDeductions = lease.MoveOutDeductions,
            MoveOutDeductionReason = lease.MoveOutDeductionReason,
            MoveOutSettledDeposit = lease.MoveOutSettledDeposit,
            MoveOutSettledAt = lease.MoveOutSettledAt,
            RenewalRequestedAt = lease.RenewalRequestedAt,
            RenewalProposedEndDate = lease.RenewalProposedEndDate,
            RenewalStatus = lease.RenewalStatus,
            Documents = lease.Documents?.Select(d => new LeaseDocumentDto
            {
                Id = d.Id,
                DocumentType = d.DocumentType,
                FileUrl = d.FileUrl,
                Title = d.Title,
                UploadedAt = d.UploadedAt
            }).ToList() ?? new List<LeaseDocumentDto>()
        };
    }
}
