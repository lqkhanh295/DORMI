using System;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Dormi.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(DormiDbContext db)
    {
        try
        {
            await db.Database.EnsureCreatedAsync();
        }
        catch
        {
            // Fallback
        }

        if (await db.Users.AnyAsync()) return; // Already seeded

        var hasher = new PasswordHasher<User>();

        var landlordUser = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
            Email = "landlord@dormi.vn",
            FullName = "Lê Văn B",
            PhoneNumber = "0901234567",
            IsVerified = true,
            Role = UserRole.Landlord,
            CreatedAt = DateTime.UtcNow
        };
        landlordUser.PasswordHash = hasher.HashPassword(landlordUser, "Password123!");

        var customerUser = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Email = "tenant@dormi.vn",
            FullName = "Nguyễn Văn A",
            Preferences = "Phòng yên tĩnh, sạch sẽ",
            Lifestyle = "clean, quiet, non-smoker, student",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        customerUser.PasswordHash = hasher.HashPassword(customerUser, "Password123!");

        var adminUser = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
            Email = "admin@dormi.vn",
            FullName = "Quản trị viên System",
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };
        adminUser.PasswordHash = hasher.HashPassword(adminUser, "Password123!");

        db.Users.AddRange(landlordUser, customerUser, adminUser);

        var room1 = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordUser.Id,
            Title = "Premium Modern Studio - District 3",
            Description = "Căn hộ Studio hiện đại với đầy đủ nội thất cao cấp tại Quận 3.",
            Price = 5500000,
            Area = 35,
            Utilities = "Wifi, Máy lạnh, Tủ lạnh, Máy giặt",
            RoomType = "Studio",
            Address = "123 Nguyễn Đình Chiểu, Q.3, TP.HCM",
            Status = RoomStatus.Available,
            CreatedAt = DateTime.UtcNow
        };
        room1.Images.Add(new RoomImage
        {
            Id = Guid.NewGuid(),
            RoomId = room1.Id,
            ImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
            IsPrimary = true
        });

        var room2 = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordUser.Id,
            Title = "Cozy Room in Shared House - D7",
            Description = "Phòng trọ thoáng mát, gần trường đại học tại Quận 7.",
            Price = 4200000,
            Area = 25,
            Utilities = "Wifi, Máy lạnh, Giờ giấc tự do",
            RoomType = "Phòng trọ",
            Address = "45 Nguyễn Văn Linh, Q.7, TP.HCM",
            Status = RoomStatus.Available,
            CreatedAt = DateTime.UtcNow
        };
        room2.Images.Add(new RoomImage
        {
            Id = Guid.NewGuid(),
            RoomId = room2.Id,
            ImageUrl = "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=800&q=80",
            IsPrimary = true
        });

        db.Rooms.AddRange(room1, room2);

        var roommatePost = new RoommatePost
        {
            Id = Guid.NewGuid(),
            CustomerId = customerUser.Id,
            Title = "Tìm bạn ở ghép Quận 7 gần RMIT",
            Description = "Mình là sinh viên năm 3, lịch sự, sạch sẽ, tìm bạn ở ghép cùng san sẻ tiền phòng.",
            Budget = 3500000,
            Location = "Quận 7, TP.HCM",
            MoveInDate = DateTime.UtcNow.AddDays(7),
            GenderPreference = "Any",
            LifestyleTraits = "clean, quiet, student",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.RoommatePosts.Add(roommatePost);

        await db.SaveChangesAsync();
    }
}
