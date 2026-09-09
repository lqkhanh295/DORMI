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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
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
    }
}
