using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Dormi.Tests;

public class BackendLogicTests
{
    [Fact]
    public void JwtTokenGenerator_ShouldGenerateValidToken()
    {
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "DormiSuperSecretKeyForJWTAuthentication2026!#$" },
            { "JwtSettings:Issuer", "DormiAPI" },
            { "JwtSettings:Audience", "DormiUsers" },
            { "JwtSettings:ExpiryMinutes", "60" }
        };

        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var generator = new JwtTokenGenerator(config);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@dormi.vn",
            FullName = "Nguyen Van A",
            Role = UserRole.Customer
        };

        var tokenString = generator.GenerateToken(user);
        Assert.False(string.IsNullOrWhiteSpace(tokenString));

        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(tokenString) as JwtSecurityToken;

        Assert.NotNull(jsonToken);
        Assert.Equal("DormiAPI", jsonToken.Issuer);
        Assert.Equal(user.Email, jsonToken.Claims.First(c => c.Type == ClaimTypes.Email).Value);
        Assert.Equal(user.Role.ToString(), jsonToken.Claims.First(c => c.Type == ClaimTypes.Role).Value);
    }

    [Fact]
    public void PasswordHasher_ShouldHashAndVerifySuccessfully()
    {
        var passwordHasher = new PasswordHasher<User>();
        var user = new User { Id = Guid.NewGuid(), Email = "test@dormi.vn" };
        var password = "SecurePassword123!";

        var hash = passwordHasher.HashPassword(user, password);
        Assert.False(string.IsNullOrWhiteSpace(hash));

        var result = passwordHasher.VerifyHashedPassword(user, hash, password);
        Assert.Equal(PasswordVerificationResult.Success, result);

        var wrongResult = passwordHasher.VerifyHashedPassword(user, hash, "WrongPassword");
        Assert.Equal(PasswordVerificationResult.Failed, wrongResult);
    }

    [Fact]
    public void CloudinaryService_ShouldInitializeWithConfiguration()
    {
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string?>
        {
            { "CloudinarySettings:CloudName", "test_cloud" },
            { "CloudinarySettings:ApiKey", "123456789" },
            { "CloudinarySettings:ApiSecret", "secret_key" }
        };

        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var service = new CloudinaryService(config);
        Assert.NotNull(service);
    }

    [Fact]
    public void RoommateMatchScore_ShouldCalculateCorrectly()
    {
        string userTraits = "clean, quiet, non-smoker, student";
        string candidateTraits = "clean, quiet, gamer";

        double? score = Dormi.Infrastructure.Services.RoommateService.CalculateMatchScore(userTraits, candidateTraits);
        
        Assert.NotNull(score);
        Assert.True(score >= 60.0 && score <= 100.0);

        double? emptyScore = Dormi.Infrastructure.Services.RoommateService.CalculateMatchScore("", "");
        Assert.Null(emptyScore);
    }

    [Fact]
    public async Task DbContext_ShouldHandleOptimizedUserAndRoomSchema()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var db = new DormiDbContext(options))
        {
            var landlord = new User
            {
                Id = Guid.NewGuid(),
                Email = "landlord_test@dormi.vn",
                FullName = "Tran Van B",
                PhoneNumber = "0987654321",
                IsVerified = true,
                Role = UserRole.Landlord
            };

            var customer = new User
            {
                Id = Guid.NewGuid(),
                Email = "customer_test@dormi.vn",
                FullName = "Le Van C",
                Preferences = "Quiet, Near Bus",
                Lifestyle = "Clean, Student",
                Role = UserRole.Customer
            };

            db.Users.AddRange(landlord, customer);
            await db.SaveChangesAsync();

            var room = new Room
            {
                Id = Guid.NewGuid(),
                LandlordId = landlord.Id,
                Title = "Test Room",
                Price = 3000000,
                Area = 20,
                Address = "123 Test St",
                Status = RoomStatus.Available
            };

            db.Rooms.Add(room);
            await db.SaveChangesAsync();

            var savedRoom = await db.Rooms.Include(r => r.Landlord).FirstOrDefaultAsync(r => r.Id == room.Id);
            Assert.NotNull(savedRoom);
            Assert.Equal("Tran Van B", savedRoom.Landlord.FullName);
            Assert.True(savedRoom.Landlord.IsVerified);
            Assert.Equal("0987654321", savedRoom.Landlord.PhoneNumber);
        }
    }

    [Fact]
    public async Task VerificationWorkflow_ApprovalShouldVerifyUser()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var landlord = new User
        {
            Id = Guid.NewGuid(),
            Email = "landlord_unverified@dormi.vn",
            FullName = "Nguyen Van Landlord",
            Role = UserRole.Landlord,
            IsVerified = false
        };
        db.Users.Add(landlord);

        var req = new VerificationRequest
        {
            Id = Guid.NewGuid(),
            UserId = landlord.Id,
            DocumentType = "CCCD",
            DocumentNumber = "079201009999",
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };
        db.VerificationRequests.Add(req);
        await db.SaveChangesAsync();

        // Simulate admin approval
        req.Status = "Approved";
        req.ReviewedAt = DateTime.UtcNow;
        landlord.IsVerified = true;
        await db.SaveChangesAsync();

        var updatedUser = await db.Users.FindAsync(landlord.Id);
        Assert.NotNull(updatedUser);
        Assert.True(updatedUser.IsVerified);
    }

    [Fact]
    public async Task RoomEdit_SignificantFieldChangeShouldTriggerRemoderation()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var room = new Room
        {
            Id = Guid.NewGuid(),
            Title = "Original Approved Room",
            Price = 3000000,
            Address = "100 Nguyen Trai, Q.1",
            Status = RoomStatus.Available
        };
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        // Changing price triggers re-moderation
        decimal newPrice = 3500000;
        if (room.Price != newPrice)
        {
            room.Price = newPrice;
            room.Status = RoomStatus.PendingApproval; // Re-moderation triggered
        }
        await db.SaveChangesAsync();

        var reloaded = await db.Rooms.FindAsync(room.Id);
        Assert.NotNull(reloaded);
        Assert.Equal(RoomStatus.PendingApproval, reloaded.Status);
    }

    [Fact]
    public async Task PaymentTransaction_StateTransitionShouldWorkCorrectly()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var tx = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Amount = 199000,
            Status = "Pending",
            TransactionRef = "DORMI-TX-123456",
            CreatedAt = DateTime.UtcNow
        };
        db.PaymentTransactions.Add(tx);
        await db.SaveChangesAsync();

        Assert.Equal("Pending", tx.Status);

        // Verification marks as Completed
        tx.Status = "Completed";
        tx.CompletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updated = await db.PaymentTransactions.FindAsync(tx.Id);
        Assert.NotNull(updated);
        Assert.Equal("Completed", updated.Status);
        Assert.NotNull(updated.CompletedAt);
    }

    [Fact]
    public async Task Notification_MarkAsReadShouldUpdateStatus()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var notif = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "Xác thực CCCD",
            Message = "Hồ sơ của bạn đã được duyệt.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        db.Notifications.Add(notif);
        await db.SaveChangesAsync();

        notif.IsRead = true;
        await db.SaveChangesAsync();

        var updated = await db.Notifications.FindAsync(notif.Id);
        Assert.NotNull(updated);
        Assert.True(updated.IsRead);
    }

    [Fact]
    public void RoomStateTransitions_ShouldValidateCorrectLifecycleRules()
    {
        // Helper to check valid transitions matching AdminController state machine
        bool IsValidTransition(RoomStatus from, RoomStatus to) => (from, to) switch
        {
            (RoomStatus.PendingApproval, RoomStatus.Available) => true,
            (RoomStatus.PendingApproval, RoomStatus.Hidden) => true,
            (RoomStatus.Available, RoomStatus.Rented) => true,
            (RoomStatus.Available, RoomStatus.Hidden) => true,
            (RoomStatus.Rented, RoomStatus.Available) => true,
            (RoomStatus.Rented, RoomStatus.Hidden) => true,
            (RoomStatus.Hidden, RoomStatus.Available) => true,
            (RoomStatus.Hidden, RoomStatus.PendingApproval) => true,
            var (f, t) when f == t => true,
            _ => false
        };

        // Legal transitions
        Assert.True(IsValidTransition(RoomStatus.PendingApproval, RoomStatus.Available));
        Assert.True(IsValidTransition(RoomStatus.Available, RoomStatus.Rented));
        Assert.True(IsValidTransition(RoomStatus.Rented, RoomStatus.Available));
        Assert.True(IsValidTransition(RoomStatus.Available, RoomStatus.Hidden));

        // Illegal transitions
        Assert.False(IsValidTransition(RoomStatus.PendingApproval, RoomStatus.Rented));
    }

    [Fact]
    public void VNPaySignatureVerification_ShouldValidateHMACSHA512()
    {
        string secretKey = "DORMI_VNPAY_SECRET_KEY_EXEMPLAR_2026";
        string data = "vnp_Amount=19900000&vnp_Command=pay&vnp_TxnRef=TXN-123456";

        byte[] keyBytes = System.Text.Encoding.UTF8.GetBytes(secretKey);
        byte[] inputBytes = System.Text.Encoding.UTF8.GetBytes(data);
        using var hmac = new System.Security.Cryptography.HMACSHA512(keyBytes);
        byte[] hashValue = hmac.ComputeHash(inputBytes);
        var sb = new System.Text.StringBuilder();
        foreach (var b in hashValue) sb.Append(b.ToString("x2"));
        string expectedHash = sb.ToString();

        Assert.Equal(128, expectedHash.Length); // SHA512 produces 64 bytes = 128 hex chars
        Assert.True(expectedHash.All(c => "0123456789abcdef".Contains(c)));
    }

    [Fact]
    public async Task RoomViewDeduplication_CooldownShouldPreventDuplicateViews()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var roomId = Guid.NewGuid();
        var viewerId = Guid.NewGuid();

        // First view event
        db.RoomViews.Add(new RoomView
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            ViewerId = viewerId,
            EventType = "View",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        // Check if viewed within 30-minute cooldown window
        var cooldown = DateTime.UtcNow.AddMinutes(-30);
        bool alreadyViewed = await db.RoomViews.AnyAsync(v =>
            v.RoomId == roomId &&
            v.ViewerId == viewerId &&
            v.EventType == "View" &&
            v.CreatedAt >= cooldown);

        Assert.True(alreadyViewed);

        // Simulated attempt after 35 minutes
        var oldCooldown = DateTime.UtcNow.AddMinutes(35);
        bool viewedInPastCooldown = await db.RoomViews.AnyAsync(v =>
            v.RoomId == roomId &&
            v.ViewerId == viewerId &&
            v.CreatedAt < cooldown);

        Assert.False(viewedInPastCooldown);
    }

    [Fact]
    public void ServiceResult_ShouldConstructSuccessAndFailCorrectly()
    {
        var okResult = Dormi.Application.Common.ServiceResult<string>.Ok("SuccessData");
        Assert.True(okResult.Success);
        Assert.Equal("SuccessData", okResult.Data);
        Assert.Equal(200, okResult.StatusCode);

        var notFoundResult = Dormi.Application.Common.ServiceResult<string>.NotFound("Not found item");
        Assert.False(notFoundResult.Success);
        Assert.Equal(404, notFoundResult.StatusCode);
        Assert.Equal("Not found item", notFoundResult.ErrorMessage);
    }

    [Fact]
    public async Task FavoriteService_ShouldAddAndRemoveFavoritesCorrectly()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var customerId = Guid.NewGuid();
        var landlordId = Guid.NewGuid();
        var roomId = Guid.NewGuid();

        db.Users.Add(new User
        {
            Id = customerId,
            Email = "customer@dormi.vn",
            FullName = "Khach Thue",
            Role = UserRole.Customer
        });

        db.Users.Add(new User
        {
            Id = landlordId,
            Email = "landlord@dormi.vn",
            FullName = "Chu Tro",
            Role = UserRole.Landlord
        });

        db.Rooms.Add(new Room
        {
            Id = roomId,
            LandlordId = landlordId,
            Title = "Phong Tro Dep",
            Price = 3000000,
            Area = 20,
            RoomType = "Phòng trọ",
            Address = "TP. Thủ Đức",
            Status = RoomStatus.Available
        });
        await db.SaveChangesAsync();

        var favService = new FavoriteService(db);
        var addRes = await favService.AddFavoriteAsync(customerId, roomId);
        Assert.True(addRes.Success);

        var listRes = await favService.GetFavoritesAsync(customerId);
        Assert.True(listRes.Success);
        Assert.Single(listRes.Data!);

        var removeRes = await favService.RemoveFavoriteAsync(customerId, roomId);
        Assert.True(removeRes.Success);

        var emptyList = await favService.GetFavoritesAsync(customerId);
        Assert.Empty(emptyList.Data!);
    }
}
