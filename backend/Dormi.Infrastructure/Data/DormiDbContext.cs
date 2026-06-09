using Dormi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Data;

public class DormiDbContext : DbContext
{
    public DormiDbContext(DbContextOptions<DormiDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<CustomerProfile> CustomerProfiles { get; set; } = null!;
    public DbSet<LandlordProfile> LandlordProfiles { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<RoomImage> RoomImages { get; set; } = null!;
    public DbSet<ViewingAppointment> ViewingAppointments { get; set; } = null!;
    public DbSet<FavoriteRoom> FavoriteRooms { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // PostGIS extension
        modelBuilder.HasPostgresExtension("postgis");

        // User - Profiles (One to One)
        modelBuilder.Entity<CustomerProfile>().HasKey(c => c.UserId);
        modelBuilder.Entity<User>()
            .HasOne(u => u.CustomerProfile)
            .WithOne(c => c.User)
            .HasForeignKey<CustomerProfile>(c => c.UserId);

        modelBuilder.Entity<LandlordProfile>().HasKey(l => l.UserId);
        modelBuilder.Entity<User>()
            .HasOne(u => u.LandlordProfile)
            .WithOne(l => l.User)
            .HasForeignKey<LandlordProfile>(l => l.UserId);

        // Landlord - Rooms (One to Many)
        modelBuilder.Entity<LandlordProfile>()
            .HasMany(l => l.Rooms)
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
