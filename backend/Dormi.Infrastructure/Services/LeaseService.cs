using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Services;

// ponytail: Lean service for Lease lifecycle and digital contract execution.
public class LeaseService : ILeaseService
{
    private readonly DormiDbContext _db;
    private readonly IKafkaProducer? _kafkaProducer;
    private readonly IDistributedLockService? _lockService;

    public LeaseService(DormiDbContext db, IKafkaProducer? kafkaProducer = null, IDistributedLockService? lockService = null)
    {
        _db = db;
        _kafkaProducer = kafkaProducer;
        _lockService = lockService;
    }

    public async Task<ServiceResult<LeaseContractResponseDto>> CreateLeaseAsync(Guid landlordId, CreateLeaseDto dto)
    {
        var landlord = await _db.Users.FindAsync(landlordId);
        if (landlord == null || landlord.Role != UserRole.Landlord)
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Chỉ Chủ trọ mới có quyền khởi tạo hợp đồng thuê.", 400);
        }

        var room = await _db.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.Id == dto.RoomId);
        if (room == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy phòng trọ.");
        if (room.LandlordId != landlordId) return ServiceResult<LeaseContractResponseDto>.Forbidden();

        var tenant = await _db.Users.FindAsync(dto.TenantId);
        if (tenant == null || tenant.Role != UserRole.Customer)
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Không tìm thấy thông tin khách thuê hợp lệ.", 400);
        }

        if (dto.StartDate >= dto.EndDate)
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Ngày bắt đầu hợp đồng phải trước ngày kết thúc.", 400);
        }

        if (room.Status == RoomStatus.Rented)
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Phòng trọ này hiện đã được cho thuê.", 400);
        }

        var hasOverlappingLease = await _db.LeaseContracts.AnyAsync(l =>
            l.RoomId == dto.RoomId &&
            (l.Status == "Active" || l.Status == "PendingSignature") &&
            l.StartDate < dto.EndDate && dto.StartDate < l.EndDate);

        if (hasOverlappingLease)
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Phòng trọ này đã có hợp đồng thuê đang có hiệu lực hoặc đang chờ ký trong khoảng thời gian này.", 400);
        }

        // Link with RentalApplication if supplied
        RentalApplication? linkedApplication = null;
        if (dto.RentalApplicationId.HasValue)
        {
            linkedApplication = await _db.RentalApplications.FindAsync(dto.RentalApplicationId.Value);
            if (linkedApplication != null)
            {
                linkedApplication.Status = ApplicationStatus.Approved;
                linkedApplication.ReviewedAt = DateTime.UtcNow;
            }
        }

        var lease = new LeaseContract
        {
            Id = Guid.NewGuid(),
            RentalApplicationId = dto.RentalApplicationId,
            RoomId = dto.RoomId,
            LandlordId = landlordId,
            TenantId = dto.TenantId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MonthlyRent = dto.MonthlyRent > 0 ? dto.MonthlyRent : room.Price,
            Deposit = dto.Deposit,
            UtilitiesDescription = dto.UtilitiesDescription ?? room.Utilities,
            TermsAndConditions = dto.TermsAndConditions,
            PaymentCycleMonths = dto.PaymentCycleMonths > 0 ? dto.PaymentCycleMonths : 1,
            ContractDocumentUrl = dto.ContractDocumentUrl,
            Status = "PendingSignature",
            LandlordSigned = true,
            LandlordSignedAt = DateTime.UtcNow,
            TenantSigned = false,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.Documents != null && dto.Documents.Count > 0)
        {
            foreach (var doc in dto.Documents)
            {
                lease.Documents.Add(new LeaseDocument
                {
                    Id = Guid.NewGuid(),
                    LeaseContractId = lease.Id,
                    DocumentType = doc.DocumentType,
                    FileUrl = doc.FileUrl,
                    Title = doc.Title,
                    UploadedAt = DateTime.UtcNow
                });
            }
        }

        _db.LeaseContracts.Add(lease);
        await _db.SaveChangesAsync();

        if (_kafkaProducer != null)
        {
            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = "LeasePendingSignature",
                UserId = tenant.Id,
                Title = "Hợp đồng thuê phòng mới đang chờ bạn ký",
                Message = $"Chủ nhà {landlord.FullName} đã tạo hợp đồng thuê cho phòng '{room.Title}'. Vui lòng kiểm tra các điều khoản và ký hợp đồng.",
                Type = "Lease",
                LinkUrl = "/tenant/leases",
                CreatedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, object?>
                {
                    ["leaseId"] = lease.Id.ToString(),
                    ["roomId"] = room.Id.ToString(),
                    ["landlordId"] = landlordId.ToString()
                }
            });
        }

        return ServiceResult<LeaseContractResponseDto>.Ok(MapToDto(lease, room, landlord, tenant));
    }

    public async Task<ServiceResult<List<LeaseContractResponseDto>>> GetMyLeasesAsync(Guid userId)
    {
        var leases = await _db.LeaseContracts
            .Include(l => l.Room)
                .ThenInclude(r => r.Images)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Include(l => l.Documents)
            .Where(l => l.LandlordId == userId || l.TenantId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        var dtos = leases.Select(l => MapToDto(l, l.Room, l.Landlord, l.Tenant)).ToList();
        return ServiceResult<List<LeaseContractResponseDto>>.Ok(dtos);
    }

    public async Task<ServiceResult<LeaseContractResponseDto>> GetLeaseByIdAsync(Guid leaseId, Guid userId, bool isAdmin)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room)
                .ThenInclude(r => r.Images)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");

        if (!isAdmin && lease.LandlordId != userId && lease.TenantId != userId)
        {
            return ServiceResult<LeaseContractResponseDto>.Forbidden();
        }

        return ServiceResult<LeaseContractResponseDto>.Ok(MapToDto(lease, lease.Room, lease.Landlord, lease.Tenant));
    }

    public async Task<ServiceResult<LeaseContractResponseDto>> SignLeaseByTenantAsync(Guid leaseId, Guid tenantId, SignLeaseDto dto)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");
        if (lease.TenantId != tenantId) return ServiceResult<LeaseContractResponseDto>.Forbidden();

        if (lease.Status == "Active")
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Hợp đồng này đã có hiệu lực trước đó.", 400);
        }

        if (lease.Status == "Terminated" || lease.Status == "Expired")
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Hợp đồng này đã kết thúc, không thể ký.", 400);
        }

        if (!dto.AgreedToTerms)
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Bạn cần tích đồng ý với các điều khoản hợp đồng trước khi ký.", 400);
        }

        // ponytail: Distributed lock prevents concurrent duplicate lease signing on the same room.
        var lockKey = $"lease_signing:{lease.RoomId}";
        if (_lockService != null)
        {
            var acquired = await _lockService.TryAcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
            if (!acquired)
            {
                return ServiceResult<LeaseContractResponseDto>.Fail("Hệ thống đang xử lý ký hợp đồng cho phòng này, vui lòng thử lại sau giây lát.", 409);
            }
        }

        try
        {
            var room = await _db.Rooms.FindAsync(lease.RoomId);
            if (room != null && room.Status == RoomStatus.Rented && lease.Status != "Active")
            {
                return ServiceResult<LeaseContractResponseDto>.Fail("Phòng trọ này hiện đã được cho thuê.", 409);
            }

            lease.TenantSigned = true;
            lease.TenantSignedAt = DateTime.UtcNow;
            lease.TenantSignatureData = dto.SignatureData;
            lease.Status = "Active";
            lease.ActivatedAt = DateTime.UtcNow;

            // ponytail: Synchronize inventory state - room is now occupied/rented
            if (room != null)
            {
                room.Status = RoomStatus.Rented;
            }

            // ponytail: Generate initial payment schedules (Deposit + 1st month rent)
            var roomTitle = lease.Room?.Title ?? room?.Title ?? "phòng";
            var depositSchedule = new RentalPaymentSchedule
            {
                Id = Guid.NewGuid(),
                LeaseContractId = lease.Id,
                Type = "Deposit",
                Title = $"Tiền đặt cọc hợp đồng ({roomTitle})",
                Amount = lease.Deposit,
                DueDate = lease.StartDate,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            var firstRentSchedule = new RentalPaymentSchedule
            {
                Id = Guid.NewGuid(),
                LeaseContractId = lease.Id,
                Type = "Rent",
                Title = $"Tiền thuê tháng đầu tiên ({roomTitle})",
                Amount = lease.MonthlyRent,
                DueDate = lease.StartDate,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _db.RentalPaymentSchedules.AddRange(depositSchedule, firstRentSchedule);

            await _db.SaveChangesAsync();

            if (_kafkaProducer != null)
            {
                await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
                {
                    Id = Guid.NewGuid(),
                    EventType = "LeaseActivated",
                    UserId = lease.LandlordId,
                    Title = "Khách thuê đã ký hợp đồng điện tử",
                    Message = $"Khách thuê {lease.Tenant.FullName} đã ký hợp đồng thuê cho phòng '{lease.Room?.Title ?? room?.Title ?? "phòng"}'. Hợp đồng chính thức có hiệu lực!",
                    Type = "Lease",
                    LinkUrl = "/landlord/leases",
                    CreatedAt = DateTime.UtcNow,
                    Metadata = new Dictionary<string, object?>
                    {
                        ["leaseId"] = lease.Id.ToString(),
                        ["roomId"] = lease.RoomId.ToString()
                    }
                });
            }

            return ServiceResult<LeaseContractResponseDto>.Ok(MapToDto(lease, lease.Room ?? room!, lease.Landlord, lease.Tenant));
        }
        finally
        {
            if (_lockService != null)
            {
                await _lockService.ReleaseLockAsync(lockKey);
            }
        }
    }

    public async Task<ServiceResult<LeaseContractResponseDto>> TerminateLeaseAsync(Guid leaseId, Guid userId, bool isAdmin, TerminateLeaseDto dto)
    {
        var lease = await _db.LeaseContracts
            .Include(l => l.Room)
            .Include(l => l.Landlord)
            .Include(l => l.Tenant)
            .FirstOrDefaultAsync(l => l.Id == leaseId);

        if (lease == null) return ServiceResult<LeaseContractResponseDto>.NotFound("Không tìm thấy hợp đồng thuê.");

        if (!isAdmin && lease.LandlordId != userId && lease.TenantId != userId)
        {
            return ServiceResult<LeaseContractResponseDto>.Forbidden();
        }

        if (lease.Status == "Terminated")
        {
            return ServiceResult<LeaseContractResponseDto>.Fail("Hợp đồng đã được chấm dứt trước đó.", 400);
        }

        lease.Status = "Terminated";
        lease.TerminatedAt = DateTime.UtcNow;
        lease.TerminationReason = dto.Reason;

        // ponytail: If no other active lease on this room, revert room status to Available
        var hasOtherActiveLease = await _db.LeaseContracts.AnyAsync(l =>
            l.RoomId == lease.RoomId &&
            l.Id != lease.Id &&
            l.Status == "Active");

        if (!hasOtherActiveLease)
        {
            var room = await _db.Rooms.FindAsync(lease.RoomId);
            if (room != null && room.Status == RoomStatus.Rented)
            {
                room.Status = RoomStatus.Available;
            }
        }

        await _db.SaveChangesAsync();

        if (_kafkaProducer != null)
        {
            var recipientId = (lease.LandlordId == userId) ? lease.TenantId : lease.LandlordId;
            await _kafkaProducer.PublishNotificationAsync(new NotificationEvent
            {
                Id = Guid.NewGuid(),
                EventType = "LeaseTerminated",
                UserId = recipientId,
                Title = "Hợp đồng thuê phòng đã kết thúc",
                Message = $"Hợp đồng thuê phòng '{lease.Room.Title}' đã được thanh lý/chấm dứt. Lý do: {dto.Reason}.",
                Type = "Lease",
                LinkUrl = "/leases",
                CreatedAt = DateTime.UtcNow
            });
        }

        return ServiceResult<LeaseContractResponseDto>.Ok(MapToDto(lease, lease.Room, lease.Landlord, lease.Tenant));
    }

    private static LeaseContractResponseDto MapToDto(LeaseContract lease, Room room, User landlord, User tenant)
    {
        return new LeaseContractResponseDto
        {
            Id = lease.Id,
            RentalApplicationId = lease.RentalApplicationId,
            RoomId = lease.RoomId,
            RoomTitle = room.Title,
            RoomAddress = room.Address,
            RoomImageUrl = room.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault(),
            LandlordId = lease.LandlordId,
            LandlordName = landlord.FullName,
            LandlordPhone = landlord.PhoneNumber,
            LandlordEmail = landlord.Email,
            TenantId = lease.TenantId,
            TenantName = tenant.FullName,
            TenantPhone = tenant.PhoneNumber,
            TenantEmail = tenant.Email,
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
            Documents = lease.Documents.Select(d => new LeaseDocumentDto
            {
                Id = d.Id,
                DocumentType = d.DocumentType,
                FileUrl = d.FileUrl,
                Title = d.Title,
                UploadedAt = d.UploadedAt
            }).ToList()
        };
    }
}
