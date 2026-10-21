using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Dormi.Infrastructure.Data;

public class DormiDbContext : DbContext
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public DormiDbContext(
        DbContextOptions<DormiDbContext> options,
        IHttpContextAccessor? httpContextAccessor = null) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        OnBeforeSaveChanges();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        OnBeforeSaveChanges();
        return base.SaveChanges();
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<RoomImage> RoomImages { get; set; } = null!;
    public DbSet<ViewingAppointment> ViewingAppointments { get; set; } = null!;
    public DbSet<FavoriteRoom> FavoriteRooms { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<RoommatePost> RoommatePosts { get; set; } = null!;
    public DbSet<RoomReview> RoomReviews { get; set; } = null!;
    public DbSet<LandlordSubscription> LandlordSubscriptions { get; set; } = null!;
    public DbSet<RoomReport> RoomReports { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<VerificationRequest> VerificationRequests { get; set; } = null!;
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; } = null!;
    public DbSet<RoomView> RoomViews { get; set; } = null!;
    public DbSet<TenantReview> TenantReviews { get; set; } = null!;
    public DbSet<LeaseContract> LeaseContracts { get; set; } = null!;
    public DbSet<RentalApplication> RentalApplications { get; set; } = null!;
    public DbSet<ApplicationDocument> ApplicationDocuments { get; set; } = null!;
    public DbSet<LeaseDocument> LeaseDocuments { get; set; } = null!;
    public DbSet<RentalPaymentSchedule> RentalPaymentSchedules { get; set; } = null!;
    public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PostgreSQL PostGIS extension
        modelBuilder.HasPostgresExtension("postgis");

        // Spatial Location Point on Room (PostGIS geography for precise geodesic distance in meters)
        modelBuilder.Entity<Room>()
            .Property(r => r.Location)
            .HasColumnType("geography(Point, 4326)");
        
        // Landlord (User) - Rooms (One to Many)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Rooms)
            .WithOne(r => r.Landlord)
            .HasForeignKey(r => r.LandlordId);

        // FavoriteRoom (Many to Many Junction)
        modelBuilder.Entity<FavoriteRoom>()
            .HasKey(f => new { f.CustomerId, f.RoomId });

        modelBuilder.Entity<FavoriteRoom>()
            .HasOne(f => f.Customer)
            .WithMany(c => c.FavoriteRooms)
            .HasForeignKey(f => f.CustomerId);

        modelBuilder.Entity<FavoriteRoom>()
            .HasOne(f => f.Room)
            .WithMany(r => r.FavoritedBy)
            .HasForeignKey(f => f.RoomId);

        // Messages
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Tenant Reviews
        modelBuilder.Entity<TenantReview>()
            .HasOne(t => t.Landlord)
            .WithMany()
            .HasForeignKey(t => t.LandlordId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TenantReview>()
            .HasOne(t => t.Tenant)
            .WithMany()
            .HasForeignKey(t => t.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Lease Contracts
        modelBuilder.Entity<LeaseContract>()
            .HasOne(l => l.Landlord)
            .WithMany()
            .HasForeignKey(l => l.LandlordId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaseContract>()
            .HasOne(l => l.Tenant)
            .WithMany()
            .HasForeignKey(l => l.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaseContract>()
            .HasMany(l => l.Documents)
            .WithOne(d => d.LeaseContract)
            .HasForeignKey(d => d.LeaseContractId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LeaseContract>()
            .HasOne(l => l.RentalApplication)
            .WithMany()
            .HasForeignKey(l => l.RentalApplicationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Room Views
        modelBuilder.Entity<RoomView>()
            .HasOne(rv => rv.Room)
            .WithMany()
            .HasForeignKey(rv => rv.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        // Rental Applications
        modelBuilder.Entity<RentalApplication>()
            .HasOne(ra => ra.Room)
            .WithMany(r => r.Applications)
            .HasForeignKey(ra => ra.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RentalApplication>()
            .HasOne(ra => ra.Tenant)
            .WithMany(u => u.RentalApplications)
            .HasForeignKey(ra => ra.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RentalApplication>()
            .HasMany(ra => ra.Documents)
            .WithOne(d => d.RentalApplication)
            .HasForeignKey(d => d.RentalApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Rental Payment Schedules (Tenant -> Landlord)
        modelBuilder.Entity<RentalPaymentSchedule>()
            .HasOne(s => s.LeaseContract)
            .WithMany(l => l.PaymentSchedules)
            .HasForeignKey(s => s.LeaseContractId)
            .OnDelete(DeleteBehavior.Cascade);

        // Maintenance Requests
        modelBuilder.Entity<MaintenanceRequest>()
            .HasOne(m => m.LeaseContract)
            .WithMany(l => l.MaintenanceRequests)
            .HasForeignKey(m => m.LeaseContractId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MaintenanceRequest>()
            .HasOne(m => m.Tenant)
            .WithMany()
            .HasForeignKey(m => m.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MaintenanceRequest>()
            .HasOne(m => m.Landlord)
            .WithMany()
            .HasForeignKey(m => m.LandlordId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MaintenanceRequest>()
            .HasOne(m => m.Room)
            .WithMany()
            .HasForeignKey(m => m.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- High-Performance Read Indexes ---
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Room>()
            .HasIndex(r => new { r.Status, r.CreatedAt });
        modelBuilder.Entity<Room>()
            .HasIndex(r => r.LandlordId);
        modelBuilder.Entity<Room>()
            .HasIndex(r => r.Price);

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.CreatedAt });
        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.IsRead });

        modelBuilder.Entity<ViewingAppointment>()
            .HasIndex(a => new { a.RoomId, a.Status });
        modelBuilder.Entity<ViewingAppointment>()
            .HasIndex(a => a.CustomerId);

        modelBuilder.Entity<RentalApplication>()
            .HasIndex(ra => new { ra.RoomId, ra.Status });
        modelBuilder.Entity<RentalApplication>()
            .HasIndex(ra => ra.TenantId);

        modelBuilder.Entity<LeaseContract>()
            .HasIndex(l => new { l.RoomId, l.Status });
        modelBuilder.Entity<LeaseContract>()
            .HasIndex(l => l.TenantId);
        modelBuilder.Entity<LeaseContract>()
            .HasIndex(l => l.LandlordId);

        modelBuilder.Entity<RentalPaymentSchedule>()
            .HasIndex(s => new { s.LeaseContractId, s.Status });
        modelBuilder.Entity<RentalPaymentSchedule>()
            .HasIndex(s => s.DueDate);

        modelBuilder.Entity<MaintenanceRequest>()
            .HasIndex(m => new { m.LeaseContractId, m.Status });

        modelBuilder.Entity<Message>()
            .HasIndex(m => new { m.SenderId, m.ReceiverId, m.SentAt });
        modelBuilder.Entity<Message>()
            .HasIndex(m => new { m.ReceiverId, m.IsRead });
    }

    private void OnBeforeSaveChanges()
    {
        try
        {
            ChangeTracker.DetectChanges();

            var httpContext = _httpContextAccessor?.HttpContext;
            var currentUserIdStr = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? httpContext?.User?.FindFirst("id")?.Value
                ?? httpContext?.User?.FindFirst("sub")?.Value;
            Guid? currentUserId = Guid.TryParse(currentUserIdStr, out var parsedId) ? parsedId : null;

            var currentEmail = httpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
                ?? httpContext?.User?.FindFirst("email")?.Value
                ?? httpContext?.User?.Identity?.Name
                ?? string.Empty;

            var clientIp = httpContext?.Connection?.RemoteIpAddress?.ToString()
                ?? httpContext?.Request?.Headers["X-Forwarded-For"].FirstOrDefault()
                ?? "127.0.0.1";

            var auditEntries = new List<AuditLog>();

            foreach (var entry in ChangeTracker.Entries())
            {
                // Never audit AuditLog itself to prevent recursion; also ignore high-frequency noise
                if (entry.Entity is AuditLog ||
                    entry.Entity is RoomView ||
                    entry.Entity is Notification ||
                    entry.Entity is Message ||
                    entry.Entity is FavoriteRoom ||
                    entry.Entity is RoomImage ||
                    entry.Entity is ApplicationDocument ||
                    entry.Entity is LeaseDocument)
                {
                    continue;
                }

                if (entry.State != EntityState.Added &&
                    entry.State != EntityState.Modified &&
                    entry.State != EntityState.Deleted)
                {
                    continue;
                }

                var auditLog = CreateAuditLogForEntry(entry, currentUserId, currentEmail, clientIp);
                if (auditLog != null)
                {
                    auditEntries.Add(auditLog);
                }
            }

            if (auditEntries.Count > 0)
            {
                AuditLogs.AddRange(auditEntries);
            }
        }
        catch
        {
            // Fail-safe: Audit logging should never prevent core domain operations from succeeding
        }
    }

    private static AuditLog? CreateAuditLogForEntry(
        EntityEntry entry,
        Guid? currentUserId,
        string currentEmail,
        string clientIp)
    {
        var action = string.Empty;
        var entityType = entry.Entity.GetType().Name;
        var entityId = string.Empty;
        var details = string.Empty;
        Guid? actorId = currentUserId;
        var actorEmail = currentEmail;

        switch (entry.Entity)
        {
            case User u:
                entityId = u.Id.ToString();
                if (entry.State == EntityState.Added)
                {
                    action = "UserRegistration";
                    details = $"Đăng ký tài khoản: {u.FullName} ({u.Email}) - Vai trò: {u.Role}";
                    actorId = u.Id;
                    actorEmail = u.Email;
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "UserUpdated";
                    details = $"Cập nhật thông tin tài khoản: {u.FullName} ({u.Email})";
                    if (string.IsNullOrEmpty(actorEmail)) actorEmail = u.Email;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    action = "UserDeleted";
                    details = $"Xóa tài khoản người dùng: {u.FullName} ({u.Email})";
                }
                break;

            case Room r:
                entityId = r.Id.ToString();
                actorId ??= r.LandlordId;
                if (entry.State == EntityState.Added)
                {
                    action = "RoomCreated";
                    details = $"Đăng tin phòng trọ: \"{r.Title}\" - Giá: {r.Price:N0} đ/tháng - Địa chỉ: {r.Address}";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "RoomUpdated";
                    details = $"Cập nhật tin phòng trọ: \"{r.Title}\" - Trạng thái: {r.Status} - Giá: {r.Price:N0} đ";
                }
                else if (entry.State == EntityState.Deleted)
                {
                    action = "RoomDeleted";
                    details = $"Xóa tin phòng trọ: \"{r.Title}\"";
                }
                break;

            case RentalApplication ra:
                entityId = ra.Id.ToString();
                actorId ??= ra.TenantId;
                if (entry.State == EntityState.Added)
                {
                    action = "ApplicationSubmitted";
                    details = $"Nộp hồ sơ thuê phòng (Phòng ID: {ra.RoomId}, Thu nhập: {ra.MonthlyIncome:N0} đ/tháng)";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "ApplicationStatusChanged";
                    details = $"Cập nhật trạng thái hồ sơ thuê phòng ID: {ra.RoomId} sang: {ra.Status}";
                }
                else if (entry.State == EntityState.Deleted)
                {
                    action = "ApplicationDeleted";
                    details = $"Xóa hồ sơ thuê phòng ID: {ra.RoomId}";
                }
                break;

            case LeaseContract lc:
                entityId = lc.Id.ToString();
                actorId ??= lc.LandlordId != Guid.Empty ? lc.LandlordId : lc.TenantId;
                if (entry.State == EntityState.Added)
                {
                    action = "LeaseCreated";
                    details = $"Khởi tạo hợp đồng thuê (Phòng ID: {lc.RoomId}, Giá thuê: {lc.MonthlyRent:N0} đ, Tiền cọc: {lc.Deposit:N0} đ)";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "LeaseUpdated";
                    details = $"Cập nhật hợp đồng thuê: Trạng thái {lc.Status} (Chủ trọ ký: {(lc.LandlordSigned ? "Rồi" : "Chưa")}, Khách ký: {(lc.TenantSigned ? "Rồi" : "Chưa")})";
                }
                else if (entry.State == EntityState.Deleted)
                {
                    action = "LeaseDeleted";
                    details = $"Hủy / Xóa hợp đồng thuê ID: {lc.Id}";
                }
                break;

            case ViewingAppointment va:
                entityId = va.Id.ToString();
                actorId ??= va.CustomerId;
                if (entry.State == EntityState.Added)
                {
                    action = "AppointmentCreated";
                    details = $"Đặt lịch xem phòng ID: {va.RoomId} vào ngày {va.AppointmentDate:dd/MM/yyyy HH:mm}";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "AppointmentUpdated";
                    details = $"Cập nhật lịch xem phòng ID: {va.RoomId}: Trạng thái {va.Status}";
                }
                else if (entry.State == EntityState.Deleted)
                {
                    action = "AppointmentCancelled";
                    details = $"Hủy lịch xem phòng ID: {va.RoomId}";
                }
                break;

            case PaymentTransaction pt:
                entityId = pt.Id.ToString();
                actorId ??= pt.UserId;
                if (entry.State == EntityState.Added)
                {
                    action = "PaymentCreated";
                    details = $"Khởi tạo thanh toán: {pt.Amount:N0} đ qua {pt.PaymentMethod} - Mã GD: {pt.TransactionRef}";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "PaymentUpdated";
                    details = $"Cập nhật giao dịch: {pt.Amount:N0} đ ({pt.Status}) - Mã GD: {pt.TransactionRef}";
                }
                break;

            case VerificationRequest vr:
                entityId = vr.Id.ToString();
                actorId ??= vr.UserId;
                if (entry.State == EntityState.Added)
                {
                    action = "VerificationSubmitted";
                    details = $"Gửi hồ sơ xác minh danh tính ({vr.DocumentType})";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "VerificationModerated";
                    details = $"Xử lý xác minh danh tính ({vr.DocumentType}): Trạng thái {vr.Status}";
                }
                break;

            case RoomReport rr:
                entityId = rr.Id.ToString();
                actorId ??= rr.ReporterId;
                if (entry.State == EntityState.Added)
                {
                    action = "RoomReported";
                    details = $"Gửi báo cáo vi phạm phòng ID: {rr.RoomId} - Lý do: {rr.Reason}";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "ReportResolved";
                    details = $"Xử lý báo cáo vi phạm phòng ID: {rr.RoomId} - Trạng thái: {rr.Status}";
                }
                break;

            case RoommatePost rp:
                entityId = rp.Id.ToString();
                actorId ??= rp.CustomerId;
                if (entry.State == EntityState.Added)
                {
                    action = "RoommatePostCreated";
                    details = $"Đăng tin tìm bạn ở ghép: \"{rp.Title}\" - Ngân sách: {rp.Budget:N0} đ";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "RoommatePostUpdated";
                    details = $"Cập nhật tin tìm bạn ở ghép: \"{rp.Title}\"";
                }
                else if (entry.State == EntityState.Deleted)
                {
                    action = "RoommatePostDeleted";
                    details = $"Xóa tin tìm bạn ở ghép: \"{rp.Title}\"";
                }
                break;

            case MaintenanceRequest mr:
                entityId = mr.Id.ToString();
                actorId ??= mr.TenantId;
                if (entry.State == EntityState.Added)
                {
                    action = "MaintenanceRequested";
                    details = $"Yêu cầu bảo trì: \"{mr.Title}\" - Mức ưu tiên: {mr.Priority}";
                }
                else if (entry.State == EntityState.Modified)
                {
                    action = "MaintenanceUpdated";
                    details = $"Cập nhật yêu cầu bảo trì: \"{mr.Title}\" - Trạng thái: {mr.Status}";
                }
                break;

            default:
                return null;
        }

        if (string.IsNullOrEmpty(action))
        {
            return null;
        }

        return new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = actorId,
            ActorEmail = !string.IsNullOrWhiteSpace(actorEmail) ? actorEmail : "system@dormi.vn",
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = clientIp,
            CreatedAt = DateTime.UtcNow
        };
    }
}
