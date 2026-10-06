using Dormi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Data;

public class DormiDbContext : DbContext
{
    public DormiDbContext(DbContextOptions<DormiDbContext> options) : base(options)
    {
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
    }
}
