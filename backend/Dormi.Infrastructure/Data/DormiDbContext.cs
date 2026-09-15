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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PostgreSQL PostGIS extension
        modelBuilder.HasPostgresExtension("postgis");

        // Spatial Location Point on Room
        modelBuilder.Entity<Room>()
            .Property(r => r.Location)
            .HasColumnType("geometry(Point, 4326)");
        
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

        // Room Views
        modelBuilder.Entity<RoomView>()
            .HasOne(rv => rv.Room)
            .WithMany()
            .HasForeignKey(rv => rv.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
