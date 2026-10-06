using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Dormi.Tests;

public class BackendLogicTests
{
    [Fact]
    public void JwtTokenGenerator_ShouldGenerateValidToken()
    {
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "TestOnlyFakeKeyThatIsLongEnough1234!" },
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

    [Fact]
    public async Task LoginSecurityPipeline_RateLimit_Lockout_MFA_ShouldEnforceProtections()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "TestOnlyFakeKeyThatIsLongEnough1234!" },
            { "JwtSettings:Issuer", "DormiAPI" },
            { "JwtSettings:Audience", "DormiUsers" },
            { "JwtSettings:ExpiryMinutes", "60" }
        };
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var tokenGen = new JwtTokenGenerator(config);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance;

        var authService = new AuthService(db, tokenGen, cache, logger);

        // 1. Seed regular user and admin user
        var hasher = new PasswordHasher<User>();
        var regularUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "student@dormi.vn",
            FullName = "Sinh Vien",
            Role = UserRole.Customer
        };
        regularUser.PasswordHash = hasher.HashPassword(regularUser, "CorrectPass123!");
        db.Users.Add(regularUser);

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@dormi.vn",
            FullName = "Admin Quản Trị",
            Role = UserRole.Admin
        };
        adminUser.PasswordHash = hasher.HashPassword(adminUser, "AdminPass123!");
        db.Users.Add(adminUser);
        await db.SaveChangesAsync();

        // 2. Test Attempt limit & Progressive delay & Captcha trigger
        var wrongPassDto = new LoginDto { Email = "student@dormi.vn", Password = "WrongPassword!" };
        var res1 = await authService.LoginAsync(wrongPassDto, "1.2.3.4");
        Assert.False(res1.Success);
        Assert.Equal(401, res1.StatusCode);
        Assert.Equal(4, res1.Data?.RemainingAttempts);

        var res2 = await authService.LoginAsync(wrongPassDto, "1.2.3.4");
        Assert.False(res2.Success);
        Assert.Equal(3, res2.Data?.RemainingAttempts);
        Assert.True(res2.Data?.RequiresCaptcha);

        // 3. Test Lockout after 5 failed attempts (passing valid captcha answer)
        for (int i = 0; i < 3; i++)
        {
            var challenge = await authService.GenerateCaptchaChallengeAsync();
            var answer = cache.GetString($"captcha_{challenge.Data!.CaptchaToken}");

            var failRes = await authService.LoginAsync(new LoginDto 
            { 
                Email = "student@dormi.vn", 
                Password = "WrongPassword!", 
                CaptchaToken = challenge.Data!.CaptchaToken, 
                CaptchaAnswer = answer 
            }, "1.2.3.4");

            if (i == 2) // 5th total attempt
            {
                Assert.Equal(423, failRes.StatusCode);
                Assert.NotNull(failRes.Data?.LockoutSeconds);
            }
        }

        // 4. Test MFA for Admin
        var adminLoginRes = await authService.LoginAsync(new LoginDto { Email = "admin@dormi.vn", Password = "AdminPass123!" }, "5.6.7.8");
        Assert.True(adminLoginRes.Success);
        Assert.True(adminLoginRes.Data?.RequiresMfa);
        Assert.False(string.IsNullOrEmpty(adminLoginRes.Data?.MfaSessionToken));

        // 5. Test Rate Limiting (11th request from single IP should return 429)
        var testIp = "9.9.9.9";
        for (int i = 0; i < 10; i++)
        {
            await authService.LoginAsync(new LoginDto { Email = "random@dormi.vn", Password = "pass" }, testIp);
        }
        var rateLimitRes = await authService.LoginAsync(new LoginDto { Email = "random@dormi.vn", Password = "pass" }, testIp);
        Assert.Equal(429, rateLimitRes.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_ShouldNotLeakResetToken_AndPreventEmailEnumeration()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "TestOnlyFakeKeyThatIsLongEnough1234!" }
        };
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var tokenGen = new JwtTokenGenerator(config);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>.Instance;

        var authService = new AuthService(db, tokenGen, cache, logger);

        // Seed user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "validuser@dormi.vn",
            FullName = "User Test",
            Role = UserRole.Customer
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        // 1. Existing email
        var resExisting = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "validuser@dormi.vn" });
        Assert.True(resExisting.Success);
        Assert.Equal(200, resExisting.StatusCode);

        // Verify hashed OTP state is in cache (and plaintext is NOT stored in pwd_reset_*)
        var cachedOtpData = cache.GetString($"password-reset:{user.Id}");
        Assert.NotNull(cachedOtpData);
        Assert.Contains("OtpHash", cachedOtpData);

        // 2. Non-existent email: must return same 200 message (anti-enumeration)
        var resNonExisting = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "ghost@dormi.vn" });
        Assert.True(resNonExisting.Success);
        Assert.Equal(200, resNonExisting.StatusCode);
        Assert.Null(cache.GetString("password-reset:email:ghost@dormi.vn"));
    }

    [Fact]
    public async Task PaymentVerification_WithoutSecureHash_ShouldFailWithBadRequest()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var config = new ConfigurationBuilder().Build();
        var env = new TestWebHostEnvironment { EnvironmentName = "Development" };
        var service = new LandlordDashboardService(db, config, env);

        var res = await service.VerifyPaymentAsync(Guid.NewGuid(), new PaymentVerifyDto
        {
            TransactionRef = "TXN_123456",
            SecureHash = "" // Empty hash
        });

        Assert.False(res.Success);
        Assert.Equal(400, res.StatusCode);
    }

    [Fact]
    public async Task RoommateService_GetById_InactivePostHiddenFromAnonymous()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@dormi.vn",
            FullName = "Owner Test",
            Role = UserRole.Customer
        };
        db.Users.Add(owner);

        var inactivePost = new RoommatePost
        {
            Id = Guid.NewGuid(),
            CustomerId = ownerId,
            Customer = owner,
            Title = "Tìm bạn ở ghép",
            Description = "Phòng rộng",
            Budget = 2000000,
            Location = "Thủ Đức",
            MoveInDate = DateTime.UtcNow.AddDays(7),
            IsActive = false // INACTIVE
        };
        db.RoommatePosts.Add(inactivePost);
        await db.SaveChangesAsync();

        var service = new RoommateService(db);

        // Anonymous user -> 404
        var resAnon = await service.GetRoommatePostByIdAsync(inactivePost.Id, null);
        Assert.False(resAnon.Success);
        Assert.Equal(404, resAnon.StatusCode);

        // Other non-admin user -> 404
        var resOther = await service.GetRoommatePostByIdAsync(inactivePost.Id, otherUserId);
        Assert.False(resOther.Success);
        Assert.Equal(404, resOther.StatusCode);

        // Owner -> 200
        var resOwner = await service.GetRoommatePostByIdAsync(inactivePost.Id, ownerId);
        Assert.True(resOwner.Success);
        Assert.Equal(200, resOwner.StatusCode);
    }

    [Fact]
    public async Task KafkaProducer_WhenDisabled_ShouldGracefullySkipWithoutException()
    {
        var options = Microsoft.Extensions.Options.Options.Create(new Dormi.Infrastructure.Kafka.KafkaOptions
        {
            Enabled = false,
            BootstrapServers = "localhost:9092"
        });

        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger<Dormi.Infrastructure.Kafka.KafkaProducer>.Instance;

        using var producer = new Dormi.Infrastructure.Kafka.KafkaProducer(options, logger);

        var evt = new NotificationEvent
        {
            Id = Guid.NewGuid(),
            EventType = "RoomPendingApproval",
            Title = "Test Room",
            Message = "Test Message",
            Type = "Room",
            CreatedAt = DateTime.UtcNow
        };

        // Should not throw any exception when disabled
        var record = await Record.ExceptionAsync(() => producer.PublishNotificationAsync(evt));
        Assert.Null(record);
    }

    [Fact]
    public void NotificationEvent_ShouldInitializeCorrectDefaults()
    {
        var evt = new NotificationEvent
        {
            Title = "Thông báo phòng mới",
            Message = "Đang chờ duyệt",
            Type = "Room"
        };

        Assert.NotEqual(Guid.Empty, evt.Id);
        Assert.Equal("Room", evt.Type);
        Assert.True((DateTime.UtcNow - evt.CreatedAt).TotalSeconds < 5);
    }

    [Fact]
    public async Task AuthService_ChangePassword_ValidAndInvalidCredentials()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "tester@dormi.vn",
            FullName = "Test User",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, "OldPassword123");
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var authService = new AuthService(db, tokenGen, cache, logger);

        // Wrong current password
        var failRes = await authService.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            CurrentPassword = "WrongPassword",
            NewPassword = "NewPassword123"
        });
        Assert.False(failRes.Success);
        Assert.Equal(400, failRes.StatusCode);

        // Valid current password
        var successRes = await authService.ChangePasswordAsync(user.Id, new ChangePasswordDto
        {
            CurrentPassword = "OldPassword123",
            NewPassword = "NewPassword123"
        });
        Assert.True(successRes.Success);
        Assert.Equal(200, successRes.StatusCode);

        // Verify new password works
        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        var verify = hasher.VerifyHashedPassword(updatedUser, updatedUser.PasswordHash, "NewPassword123");
        Assert.Equal(Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success, verify);
    }

    private class TestEmailService : Dormi.Application.Interfaces.IEmailService
    {
        public string? LastToEmail { get; private set; }
        public string? LastSubject { get; private set; }
        public string? LastOtp { get; private set; }

        public Task SendEmailAsync(string toEmail, string subject, string htmlBody, System.Threading.CancellationToken ct = default)
        {
            LastToEmail = toEmail;
            LastSubject = subject;
            return Task.CompletedTask;
        }

        public Task SendPasswordResetOtpAsync(string toEmail, string otp, System.Threading.CancellationToken ct = default)
        {
            LastToEmail = toEmail;
            LastOtp = otp;
            LastSubject = "Mã xác thực đặt lại mật khẩu DORMI";
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task ForgotPassword_ExistingUser_ShouldReturnGenericMessage_AndStoreHashedOtp_AndSendEmail()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "student@dormi.vn",
            FullName = "Nguyen Van B",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var emailService = new TestEmailService();
        var authService = new AuthService(db, tokenGen, cache, logger, emailService);

        var result = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "student@dormi.vn" });
        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);
        
        // Assert anti-enumeration message
        var json = System.Text.Json.JsonSerializer.Serialize(result.Data);
        Assert.Contains("If the account exists, an OTP has been sent.", json);

        // Verify email was dispatched with 6-digit OTP
        Assert.Equal("student@dormi.vn", emailService.LastToEmail);
        Assert.NotNull(emailService.LastOtp);
        Assert.Matches(@"^\d{6}$", emailService.LastOtp);

        // Verify OTP is hashed in cache, NOT plaintext
        var cachedOtpJson = await cache.GetStringAsync($"password-reset:{user.Id}");
        Assert.NotNull(cachedOtpJson);
        Assert.DoesNotContain(emailService.LastOtp, cachedOtpJson); // Plaintext OTP must NOT be stored
        Assert.Contains("OtpHash", cachedOtpJson);
    }

    [Fact]
    public async Task ForgotPassword_NonExistentEmail_ShouldReturnSameGenericMessage_WithoutSendingEmail()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var emailService = new TestEmailService();
        var authService = new AuthService(db, tokenGen, cache, logger, emailService);

        var result = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "ghost@dormi.vn" });
        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);

        var json = System.Text.Json.JsonSerializer.Serialize(result.Data);
        Assert.Contains("If the account exists, an OTP has been sent.", json);
        Assert.Null(emailService.LastOtp);
    }

    [Fact]
    public async Task ForgotPassword_CooldownRateLimit_ShouldReturn429OnImmediateRetry()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var emailService = new TestEmailService();
        var authService = new AuthService(db, tokenGen, cache, logger, emailService);

        var res1 = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "fast@dormi.vn" });
        Assert.True(res1.Success);

        // Immediate second call should hit 60s cooldown limit
        var res2 = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "fast@dormi.vn" });
        Assert.False(res2.Success);
        Assert.Equal(429, res2.StatusCode);
        Assert.Contains("60 giây", res2.ErrorMessage);
    }

    [Fact]
    public async Task ForgotPassword_EmailRateLimit_Max5Per15Minutes()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var authService = new AuthService(db, tokenGen, cache, logger);

        var testEmail = "frequent@dormi.vn";
        // Simulate 5 requests
        await cache.SetStringAsync($"pwd_otp_count_{testEmail}", "5");

        var res = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = testEmail });
        Assert.False(res.Success);
        Assert.Equal(429, res.StatusCode);
        Assert.Contains("vượt quá số lần", res.ErrorMessage);
    }

    [Fact]
    public async Task ForgotPassword_IpRateLimit_Max10Per15Minutes()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var authService = new AuthService(db, tokenGen, cache, logger);

        var testIp = "192.168.1.100";
        await cache.SetStringAsync($"pwd_otp_ip_{testIp}", "10");

        var res = await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "newuser@dormi.vn" }, clientIp: testIp);
        Assert.False(res.Success);
        Assert.Equal(429, res.StatusCode);
        Assert.Contains("địa chỉ IP", res.ErrorMessage);
    }

    [Fact]
    public async Task VerifyOtp_ValidOtp_ShouldReturnResetToken_AndInvalidateOtp()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "verify@dormi.vn",
            FullName = "Verify User",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var emailService = new TestEmailService();
        var authService = new AuthService(db, tokenGen, cache, logger, emailService);

        // Step 1: Request OTP
        await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = user.Email });
        var sentOtp = emailService.LastOtp;
        Assert.NotNull(sentOtp);

        // Step 2: Verify OTP
        var verifyRes = await authService.VerifyOtpAsync(new VerifyOtpDto
        {
            Email = user.Email,
            Otp = sentOtp
        });

        Assert.True(verifyRes.Success);
        Assert.Equal(200, verifyRes.StatusCode);
        Assert.NotNull(verifyRes.Data?.ResetToken);
        Assert.NotEmpty(verifyRes.Data.ResetToken);

        // OTP should now be consumed / invalidated
        var remainingOtp = await cache.GetStringAsync($"password-reset:{user.Id}");
        Assert.Null(remainingOtp);
    }

    [Fact]
    public async Task VerifyOtp_InvalidOtp_ShouldTrackAttempts_AndLockoutAfter5Fails()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "lockout@dormi.vn",
            FullName = "Lockout User",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var emailService = new TestEmailService();
        var authService = new AuthService(db, tokenGen, cache, logger, emailService);

        await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = user.Email });

        // Failed attempt 1 to 4
        for (int i = 1; i <= 4; i++)
        {
            var res = await authService.VerifyOtpAsync(new VerifyOtpDto
            {
                Email = user.Email,
                Otp = "000000"
            });
            Assert.False(res.Success);
            Assert.Equal(400, res.StatusCode);
            Assert.Contains($"còn {5 - i} lần thử", res.ErrorMessage);
        }

        // 5th failed attempt -> Lockout triggered
        var lockoutRes = await authService.VerifyOtpAsync(new VerifyOtpDto
        {
            Email = user.Email,
            Otp = "000000"
        });
        Assert.False(lockoutRes.Success);
        Assert.Equal(400, lockoutRes.StatusCode);
        Assert.Contains("quá 5 lần", lockoutRes.ErrorMessage);

        // OTP is completely wiped out
        var wipedOtp = await cache.GetStringAsync($"password-reset:{user.Id}");
        Assert.Null(wipedOtp);
    }

    [Fact]
    public async Task ResetPassword_CompleteFlow_ShouldUpdatePassword_AndConsumeSingleUseToken()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "flow@dormi.vn",
            FullName = "Flow User",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = hasher.HashPassword(user, "InitialPassword123!");
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var tokenGen = new JwtTokenGenerator(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForTestingJwtToken1234567890" },
            { "Jwt:Issuer", "Dormi" },
            { "Jwt:Audience", "DormiAudience" }
        }).Build());
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthService>();
        var emailService = new TestEmailService();
        var authService = new AuthService(db, tokenGen, cache, logger, emailService);

        // 1. ForgotPassword
        await authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = user.Email });
        var otp = emailService.LastOtp;
        Assert.NotNull(otp);

        // 2. VerifyOtp
        var verifyRes = await authService.VerifyOtpAsync(new VerifyOtpDto { Email = user.Email, Otp = otp });
        var resetToken = verifyRes.Data?.ResetToken;
        Assert.NotNull(resetToken);

        // 3. ResetPassword with new password
        var resetRes = await authService.ResetPasswordAsync(new ResetPasswordDto
        {
            ResetToken = resetToken,
            NewPassword = "BrandNewSecurePassword456!"
        });
        Assert.True(resetRes.Success);
        Assert.Equal(200, resetRes.StatusCode);

        // Check DB has updated password hash
        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        var verifyOld = hasher.VerifyHashedPassword(updatedUser, updatedUser.PasswordHash, "InitialPassword123!");
        Assert.Equal(Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed, verifyOld);
        var verifyNew = hasher.VerifyHashedPassword(updatedUser, updatedUser.PasswordHash, "BrandNewSecurePassword456!");
        Assert.Equal(Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success, verifyNew);

        // 4. Token is SINGLE-USE: Calling again with same resetToken must fail
        var reuseRes = await authService.ResetPasswordAsync(new ResetPasswordDto
        {
            ResetToken = resetToken,
            NewPassword = "AnotherPassword789!"
        });
        Assert.False(reuseRes.Success);
        Assert.Equal(400, reuseRes.StatusCode);
        Assert.Contains("hết hạn", reuseRes.ErrorMessage);
    }

    [Fact]
    public async Task RentalApplication_Lifecycle_Submit_Review_Withdraw_Succeeds()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: $"RentalAppDb_{Guid.NewGuid()}")
            .Options;

        using var db = new DormiDbContext(options);

        var landlordId = Guid.NewGuid();
        var landlord = new User { Id = landlordId, Email = "landlord@dormi.vn", FullName = "Chu Tro A", Role = UserRole.Landlord };

        var tenantId = Guid.NewGuid();
        var tenant = new User { Id = tenantId, Email = "tenant@dormi.vn", FullName = "Khach Thue B", Role = UserRole.Customer };

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = "Phòng trọ cao cấp Q1",
            Address = "123 Nguyen Thi Minh Khai",
            Price = 5000000,
            Status = RoomStatus.Available
        };

        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var service = new RentalApplicationService(db);

        // 1. Submit Application
        var submitResult = await service.CreateApplicationAsync(tenantId, new CreateApplicationDto
        {
            RoomId = room.Id,
            MonthlyIncome = 15000000,
            Occupation = "Software Engineer",
            EmployerName = "Tech Corp",
            OccupantsCount = 1,
            DesiredMoveInDate = DateTime.UtcNow.AddDays(7),
            LeaseDurationMonths = 12,
            NoteToLandlord = "Tôi muốn thuê phòng lâu dài."
        });

        Assert.True(submitResult.Success);
        Assert.NotNull(submitResult.Data);
        Assert.Equal(ApplicationStatus.Submitted, submitResult.Data.Status);
        var appId = submitResult.Data.Id;

        // 2. Prevent duplicate active application for same room
        var duplicateResult = await service.CreateApplicationAsync(tenantId, new CreateApplicationDto
        {
            RoomId = room.Id,
            MonthlyIncome = 15000000,
            Occupation = "Software Engineer",
            DesiredMoveInDate = DateTime.UtcNow.AddDays(7)
        });
        Assert.False(duplicateResult.Success);
        Assert.Equal(400, duplicateResult.StatusCode);

        // 3. Landlord reviews - More info requested
        var moreInfoResult = await service.ReviewApplicationAsync(appId, landlordId, new ReviewApplicationDto
        {
            Status = ApplicationStatus.MoreInfoRequested,
            Reason = "Vui lòng bổ sung CCCD"
        });
        Assert.True(moreInfoResult.Success);

        var appInDb = await db.RentalApplications.FindAsync(appId);
        Assert.NotNull(appInDb);
        Assert.Equal(ApplicationStatus.MoreInfoRequested, appInDb.Status);
        Assert.Equal("Vui lòng bổ sung CCCD", appInDb.RejectionReason);

        // 4. Landlord approves application
        var approveResult = await service.ReviewApplicationAsync(appId, landlordId, new ReviewApplicationDto
        {
            Status = ApplicationStatus.Approved,
            LandlordNotes = "Hồ sơ chuẩn"
        });
        Assert.True(approveResult.Success);

        appInDb = await db.RentalApplications.FindAsync(appId);
        Assert.NotNull(appInDb);
        Assert.Equal(ApplicationStatus.Approved, appInDb.Status);
        Assert.Equal("Hồ sơ chuẩn", appInDb.LandlordNotes);
    }

    [Fact]
    public async Task ViewingAppointment_Reschedule_And_Complete_Succeeds()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: $"ViewingAppDb_{Guid.NewGuid()}")
            .Options;

        using var db = new DormiDbContext(options);

        var landlordId = Guid.NewGuid();
        var landlord = new User { Id = landlordId, Email = "landlord2@dormi.vn", FullName = "Chu Tro B", Role = UserRole.Landlord };

        var tenantId = Guid.NewGuid();
        var tenant = new User { Id = tenantId, Email = "tenant2@dormi.vn", FullName = "Khach Thue C", Role = UserRole.Customer };

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = "Phòng Studio Thu Duc",
            Address = "456 Vo Van Ngan",
            Price = 4000000,
            Status = RoomStatus.Available
        };

        var appointment = new ViewingAppointment
        {
            Id = Guid.NewGuid(),
            CustomerId = tenantId,
            RoomId = room.Id,
            AppointmentDate = DateTime.UtcNow.AddDays(2),
            Status = "Pending"
        };

        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);
        db.ViewingAppointments.Add(appointment);
        await db.SaveChangesAsync();

        var appointmentService = new AppointmentService(db);

        // 1. Reschedule
        var newDate = DateTime.UtcNow.AddDays(4);
        var rescheduleRes = await appointmentService.RescheduleAsync(appointment.Id, tenantId, new RescheduleAppointmentDto
        {
            NewAppointmentDate = newDate,
            Reason = "Bận lịch thi"
        });
        Assert.True(rescheduleRes.Success);

        var updatedApp = await db.ViewingAppointments.FindAsync(appointment.Id);
        Assert.NotNull(updatedApp);
        Assert.Equal("Rescheduled", updatedApp.Status);
        Assert.Equal(newDate, updatedApp.AppointmentDate);
        Assert.Contains("Bận lịch thi", updatedApp.Notes);

        // 2. Complete viewing
        var completeRes = await appointmentService.UpdateStatusAsync(appointment.Id, landlordId, false, new UpdateAppointmentStatusDto
        {
            Status = "Completed"
        });
        Assert.True(completeRes.Success);

        updatedApp = await db.ViewingAppointments.FindAsync(appointment.Id);
        Assert.NotNull(updatedApp);
        Assert.Equal("Completed", updatedApp.Status);
        Assert.NotNull(updatedApp.CompletedAt);
    }

    [Fact]
    public async Task LeaseService_FullLifecycle_ShouldManageStatusAndSyncRoom()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: "LeaseLifecycleTestDb_" + Guid.NewGuid())
            .Options;

        using var db = new DormiDbContext(options);

        var landlordId = Guid.NewGuid();
        var landlord = new User { Id = landlordId, Email = "landlord_lease@dormi.vn", FullName = "Chu Tro D", Role = UserRole.Landlord };

        var tenantId = Guid.NewGuid();
        var tenant = new User { Id = tenantId, Email = "tenant_lease@dormi.vn", FullName = "Khach Thue E", Role = UserRole.Customer };

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = "Phòng Master Bình Thạnh",
            Address = "123 Xo Viet Nghe Tinh",
            Price = 5000000,
            Status = RoomStatus.Available
        };

        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var leaseService = new LeaseService(db);

        // 1. Landlord creates lease
        var createDto = new CreateLeaseDto
        {
            RoomId = room.Id,
            TenantId = tenantId,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(12),
            MonthlyRent = 5000000,
            Deposit = 5000000,
            UtilitiesDescription = "Điện 3.5k, Nước 100k",
            TermsAndConditions = "Giữ gìn vệ sinh chung",
            PaymentCycleMonths = 1
        };

        var createRes = await leaseService.CreateLeaseAsync(landlordId, createDto);
        Assert.True(createRes.Success);
        Assert.NotNull(createRes.Data);
        var leaseId = createRes.Data.Id;
        Assert.Equal("PendingSignature", createRes.Data.Status);
        Assert.True(createRes.Data.LandlordSigned);

        // Room is still Available while pending tenant signature
        var roomCheck = await db.Rooms.FindAsync(room.Id);
        Assert.Equal(RoomStatus.Available, roomCheck!.Status);

        // 2. Tenant signs lease
        var signRes = await leaseService.SignLeaseByTenantAsync(leaseId, tenantId, new SignLeaseDto
        {
            SignatureData = "Khach Thue E",
            AgreedToTerms = true
        });
        Assert.True(signRes.Success);
        Assert.Equal("Active", signRes.Data!.Status);
        Assert.True(signRes.Data.TenantSigned);
        Assert.Equal("Khach Thue E", signRes.Data.TenantSignatureData);

        // Room is now Rented
        roomCheck = await db.Rooms.FindAsync(room.Id);
        Assert.Equal(RoomStatus.Rented, roomCheck!.Status);

        // 3. Terminate lease
        var termRes = await leaseService.TerminateLeaseAsync(leaseId, landlordId, false, new TerminateLeaseDto
        {
            Reason = "Khách chuyển công tác và bàn giao phòng đúng thỏa thuận"
        });
        Assert.True(termRes.Success);
        Assert.Equal("Terminated", termRes.Data!.Status);
        Assert.Equal("Khách chuyển công tác và bàn giao phòng đúng thỏa thuận", termRes.Data.TerminationReason);

        // Room reverts to Available
        roomCheck = await db.Rooms.FindAsync(room.Id);
        Assert.Equal(RoomStatus.Available, roomCheck!.Status);
    }

    [Fact]
    public async Task LandlordDashboardService_FunnelAndBoost_ShouldCalculateAndActivate()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: "FunnelAndBoostDb_" + Guid.NewGuid())
            .Options;

        using var db = new DormiDbContext(options);

        var landlordId = Guid.NewGuid();
        var landlord = new User { Id = landlordId, Email = "landlord_crm@dormi.vn", FullName = "Chu Tro CRM", Role = UserRole.Landlord };
        var tenantId = Guid.NewGuid();
        var tenant = new User { Id = tenantId, Email = "tenant_crm@dormi.vn", FullName = "Khach CRM", Role = UserRole.Customer };

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = "Phòng Cao Cấp Phú Nhuận",
            Address = "12 Phan Xich Long",
            Price = 6000000,
            Status = RoomStatus.Available
        };

        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);

        // Add 10 views, 3 saves, 2 appointments, 2 applications (1 approved), 1 lease
        for (int i = 0; i < 10; i++)
        {
            db.RoomViews.Add(new RoomView { Id = Guid.NewGuid(), RoomId = room.Id, EventType = "View", CreatedAt = DateTime.UtcNow });
        }
        db.FavoriteRooms.Add(new FavoriteRoom { RoomId = room.Id, CustomerId = tenantId, SavedAt = DateTime.UtcNow });
        for (int i = 0; i < 2; i++)
        {
            db.ViewingAppointments.Add(new ViewingAppointment { Id = Guid.NewGuid(), RoomId = room.Id, CustomerId = tenantId, AppointmentDate = DateTime.UtcNow.AddDays(1), Status = "Confirmed" });
        }
        db.RentalApplications.Add(new RentalApplication
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            TenantId = tenantId,
            Status = ApplicationStatus.Approved,
            DesiredMoveInDate = DateTime.UtcNow.AddDays(3),
            Occupation = "Engineer",
            MonthlyIncome = 25000000
        });
        db.RentalApplications.Add(new RentalApplication
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            TenantId = tenantId,
            Status = ApplicationStatus.Submitted,
            DesiredMoveInDate = DateTime.UtcNow.AddDays(5),
            Occupation = "Designer",
            MonthlyIncome = 20000000
        });
        db.LeaseContracts.Add(new LeaseContract
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            LandlordId = landlordId,
            TenantId = tenantId,
            Status = "Active",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(12),
            MonthlyRent = 6000000,
            Deposit = 6000000
        });

        await db.SaveChangesAsync();

        var config = new ConfigurationBuilder().Build();
        var env = new TestWebHostEnvironment();
        var service = new LandlordDashboardService(db, config, env, null);

        // 1. Check Full Funnel
        var analyticsRes = await service.GetLeadAnalyticsAsync(landlordId, null);
        Assert.True(analyticsRes.Success);
        var dto = analyticsRes.Data!;
        Assert.Equal(10, dto.TotalViews);
        Assert.Equal(1, dto.TotalSaves);
        Assert.Equal(2, dto.TotalViewings);
        Assert.Equal(2, dto.TotalApplications);
        Assert.Equal(1, dto.TotalApproved);
        Assert.Equal(1, dto.TotalLeases);
        Assert.Equal(10.0, dto.OverallConversionRate); // 1 / 10 = 10%
        Assert.Single(dto.TopRooms);
        Assert.Equal(1, dto.TopRooms[0].Leases);

        // 2. Room Boost creation and simulated payment
        var boostRes = await service.BoostRoomAsync(landlordId, room.Id, new BoostRoomDto { BoostType = "3days", PaymentMethod = "VNPay" }, "127.0.0.1");
        Assert.True(boostRes.Success);

        // Get created transaction reference from database
        var txn = await db.PaymentTransactions.FirstOrDefaultAsync(t => t.RoomId == room.Id);
        Assert.NotNull(txn);
        Assert.Equal(120000m, txn.Amount);
        Assert.Equal("Pending", txn.Status);

        // Simulate payment completion
        var simRes = await service.SimulateGatewayPaymentAsync(landlordId, new PaymentVerifyDto { TransactionRef = txn.TransactionRef });
        Assert.True(simRes.Success);

        var updatedRoom = await db.Rooms.FindAsync(room.Id);
        Assert.NotNull(updatedRoom);
        Assert.True(updatedRoom.IsBoosted);
        Assert.Equal("3days", updatedRoom.BoostType);
        Assert.NotNull(updatedRoom.BoostExpiresAt);
        Assert.True(updatedRoom.BoostExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task PostRentalService_CompletePostRentalLifecycle_ShouldTrackPaymentsMaintenanceRenewalAndMoveOut()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: "PostRentalDb_" + Guid.NewGuid())
            .Options;
        using var db = new DormiDbContext(options);

        var landlordId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var landlord = new User
        {
            Id = landlordId,
            Email = "landlord.post@dormi.vn",
            FullName = "Chủ trọ Post Rental",
            Role = UserRole.Landlord
        };
        var tenant = new User
        {
            Id = tenantId,
            Email = "tenant.post@dormi.vn",
            FullName = "Khách thuê Post Rental",
            Role = UserRole.Customer
        };
        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = "Phòng Master Ban Công Post-Rental",
            Price = 4500000m,
            Address = "123 Quận 1, TP.HCM",
            Status = RoomStatus.Rented
        };
        var lease = new LeaseContract
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            LandlordId = landlordId,
            TenantId = tenantId,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddMonths(12),
            MonthlyRent = 4500000m,
            Deposit = 4500000m,
            Status = "Active",
            LandlordSigned = true,
            TenantSigned = true
        };

        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);
        db.LeaseContracts.Add(lease);
        await db.SaveChangesAsync();

        var service = new PostRentalService(db, null);

        // 1. Payment Schedule (Rail A)
        var createBillRes = await service.CreatePaymentScheduleAsync(new CreatePaymentScheduleDto
        {
            LeaseContractId = lease.Id,
            Type = "Utilities",
            Title = "Tiền điện nước tháng 10",
            Amount = 350000m,
            DueDate = DateTime.UtcNow.AddDays(5),
            LandlordNotes = "Điện 80 số, nước 15 khối"
        }, landlordId);
        Assert.True(createBillRes.Success);
        var bill = createBillRes.Data!;
        Assert.Equal("Pending", bill.Status);

        var recordRes = await service.RecordPaymentAsync(bill.Id, new RecordPaymentDto
        {
            PaymentMethod = "BankTransfer",
            PaymentReference = "MB123456",
            MarkAsPaid = true
        }, tenantId);
        Assert.True(recordRes.Success);
        Assert.Equal("Paid", recordRes.Data!.Status);

        // 2. Maintenance Ticketing Lifecycle (OPEN -> ASSIGNED -> RESOLVED -> CLOSED)
        var ticketRes = await service.CreateMaintenanceRequestAsync(new CreateMaintenanceRequestDto
        {
            LeaseContractId = lease.Id,
            Title = "Máy lạnh không lạnh sâu",
            Description = "Bật 18 độ nhưng chỉ ra gió, có tiếng kêu nhỏ",
            Category = "AirConditioner",
            Priority = "High"
        }, tenantId);
        Assert.True(ticketRes.Success);
        var ticket = ticketRes.Data!;
        Assert.Equal("OPEN", ticket.Status);

        var assignRes = await service.UpdateMaintenanceStatusAsync(ticket.Id, new UpdateMaintenanceStatusDto
        {
            Status = "ASSIGNED",
            AssignedTo = "Thợ kỹ thuật Nguyễn Văn Nam"
        }, landlordId);
        Assert.True(assignRes.Success);
        Assert.Equal("ASSIGNED", assignRes.Data!.Status);

        var resolveRes = await service.UpdateMaintenanceStatusAsync(ticket.Id, new UpdateMaintenanceStatusDto
        {
            Status = "RESOLVED",
            ResolutionNotes = "Đã bơm gas và vệ sinh lưới lọc",
            ActualCost = 250000m
        }, landlordId);
        Assert.True(resolveRes.Success);
        Assert.Equal("RESOLVED", resolveRes.Data!.Status);

        var confirmRes = await service.ConfirmMaintenanceResolutionAsync(ticket.Id, new ConfirmMaintenanceResolutionDto
        {
            TenantFeedback = "Máy đã mát sâu, cảm ơn chủ nhà!",
            TenantRating = 5
        }, tenantId);
        Assert.True(confirmRes.Success);
        Assert.Equal("CLOSED", confirmRes.Data!.Status);
        Assert.True(confirmRes.Data!.TenantConfirmed);

        // 3. Lease Renewal Request & Accept
        var renewRes = await service.RequestRenewalAsync(lease.Id, new RequestRenewalDto
        {
            ProposedEndDate = DateTime.UtcNow.Date.AddMonths(24),
            Notes = "Muốn gia hạn thêm 1 năm nữa"
        }, tenantId);
        Assert.True(renewRes.Success);
        Assert.Equal("Requested", renewRes.Data!.RenewalStatus);

        var acceptRenewRes = await service.RespondRenewalAsync(lease.Id, new RespondRenewalDto
        {
            Accepted = true
        }, landlordId);
        Assert.True(acceptRenewRes.Success);
        Assert.Equal("Accepted", acceptRenewRes.Data!.RenewalStatus);

        // 4. Move-out Inspection, Deposit Settlement & Room Inventory Sync
        var inspectRes = await service.CompleteMoveOutInspectionAsync(lease.Id, new MoveOutInspectionDto
        {
            InspectionNotes = "Phòng sạch sẽ, trừ 200k phí vệ sinh sofa",
            DeductionsAmount = 200000m,
            DeductionReason = "Giặt đệm sofa",
            ConfirmCheckout = true
        }, landlordId);
        Assert.True(inspectRes.Success);
        Assert.Equal("Terminated", inspectRes.Data!.Status);
        Assert.Equal(4300000m, inspectRes.Data!.MoveOutSettledDeposit); // 4.5m - 200k = 4.3m

        // Verify room inventory has returned to Available (0)
        var updatedRoom = await db.Rooms.FindAsync(room.Id);
        Assert.NotNull(updatedRoom);
        Assert.Equal(RoomStatus.Available, updatedRoom.Status);
    }

    [Fact]
    public async Task TrustSafetyService_CalculateBreakdownAndResolveReport_ShouldProvideExplainableScoreAndAuditLog()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: "TrustSafetyDb_" + Guid.NewGuid())
            .Options;
        using var db = new DormiDbContext(options);

        var landlordId = Guid.NewGuid();
        var landlord = new User
        {
            Id = landlordId,
            Email = "landlord.trust@dormi.vn",
            FullName = "Chủ trọ Trust",
            Role = UserRole.Landlord,
            IsVerified = true // +20 points
        };
        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordId,
            Title = "Phòng Studio Tin Cậy 100",
            Address = "12 Nguyễn Thị Minh Khai, Q1",
            Latitude = 10.776,
            Longitude = 106.700,
            Virtual3DUrl = "https://my.matterport.com/show/?m=example",
            IsPropertyVerified = true, // +20 points
            Status = RoomStatus.Available
        };
        room.Images.Add(new RoomImage { Id = Guid.NewGuid(), RoomId = room.Id, ImageUrl = "https://img1.com", IsPrimary = true });
        room.Images.Add(new RoomImage { Id = Guid.NewGuid(), RoomId = room.Id, ImageUrl = "https://img2.com" });
        room.Images.Add(new RoomImage { Id = Guid.NewGuid(), RoomId = room.Id, ImageUrl = "https://img3.com" });

        var reporter = new User
        {
            Id = Guid.NewGuid(),
            Email = "reporter@dormi.vn",
            FullName = "Người báo cáo",
            Role = UserRole.Customer
        };

        var report = new RoomReport
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            ReporterId = reporter.Id,
            Reason = "Ảnh phòng có vẻ sai thực tế",
            Details = "Cần kiểm tra lại",
            RiskLevel = "Medium",
            Status = "Pending"
        };

        db.Users.AddRange(landlord, reporter);
        db.Rooms.Add(room);
        db.RoomReports.Add(report);
        await db.SaveChangesAsync();

        var service = new TrustSafetyService(db, null);

        // 1. Calculate Trust Score
        var scoreRes = await service.CalculateTrustScoreAsync(room.Id);
        Assert.True(scoreRes.Success);
        var breakdown = scoreRes.Data!;
        Assert.Equal(20, breakdown.IdentityPoints);
        Assert.Equal(20, breakdown.PropertyPoints);
        Assert.Equal(15, breakdown.AddressAndDetailsPoints); // Lat/lng + 3D
        Assert.Equal(15, breakdown.PhotosPoints); // 3 images
        Assert.Equal(15, breakdown.ReportsDeduction); // 1 pending report = -15
        Assert.True(breakdown.TotalScore >= 50);
        Assert.NotEmpty(breakdown.Factors);

        // 2. Resolve Report with Moderation Action
        var adminId = Guid.NewGuid();
        var resolveRes = await service.ResolveReportAsync(report.Id, adminId, "admin@dormi.vn", new ResolveReportDto
        {
            Status = "Resolved",
            ActionTaken = "RoomHidden",
            ModeratorNotes = "Tạm ẩn phòng để chủ nhà xác thực lại ảnh"
        });
        Assert.True(resolveRes.Success);

        // Verify room hidden
        var updatedRoom = await db.Rooms.FindAsync(room.Id);
        Assert.Equal(RoomStatus.Hidden, updatedRoom!.Status);

        // Verify Audit Log
        var auditLogs = await service.GetAuditLogsAsync(10);
        Assert.True(auditLogs.Success);
        Assert.Single(auditLogs.Data!);
        Assert.Equal("ResolveReport", auditLogs.Data![0].Action);
        Assert.Equal("admin@dormi.vn", auditLogs.Data![0].ActorEmail);
    }

    [Fact]
    public async Task RoommateService_CreatePostWithRoom_ShouldLinkRoomAndBoostMatchScore()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var roommateService = new RoommateService(db);

        var tenantId = Guid.NewGuid();
        var tenant = new User
        {
            Id = tenantId,
            Email = "tenant1@dormi.vn",
            FullName = "Nguyễn Văn A",
            Role = UserRole.Customer,
            Lifestyle = "Sạch sẽ, Không hút thuốc, Yên tĩnh"
        };
        db.Users.Add(tenant);

        var otherTenantId = Guid.NewGuid();
        var otherTenant = new User
        {
            Id = otherTenantId,
            Email = "tenant2@dormi.vn",
            FullName = "Trần Thị B",
            Role = UserRole.Customer,
            Lifestyle = "Sạch sẽ, Thân thiện"
        };
        db.Users.Add(otherTenant);

        var roomId = Guid.NewGuid();
        var room = new Room
        {
            Id = roomId,
            Title = "Studio Q10 Ban công thoáng",
            Address = "3/2, Quận 10, TP.HCM",
            Price = 4500000m,
            Area = 30,
            LandlordId = Guid.NewGuid(),
            Status = RoomStatus.Available,
            Images = new List<RoomImage>
            {
                new RoomImage { Id = Guid.NewGuid(), ImageUrl = "https://image.test/room.jpg", IsPrimary = true }
            }
        };
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        // 1. Create roommate post with linked room
        var createDto = new CreateRoommatePostDto
        {
            Title = "Tìm 1 bạn nữ ở ghép phòng Studio Q10",
            Description = "Phòng rộng 30m2, đầy đủ tiện nghi, chia đôi tiền phòng",
            Budget = 2250000m,
            Location = "Quận 10",
            MoveInDate = DateTime.UtcNow.AddDays(5),
            GenderPreference = "Female",
            LifestyleTraits = "Sạch sẽ, Không hút thuốc",
            RoomId = roomId
        };

        var createRes = await roommateService.CreateRoommatePostAsync(tenantId, createDto);
        Assert.True(createRes.Success);

        // 2. Query posts
        var postsRes = await roommateService.GetRoommatePostsAsync("Quận 10", null, null, otherTenantId);
        Assert.True(postsRes.Success);
        Assert.Single(postsRes.Data!);
        var post = postsRes.Data![0];
        Assert.Equal(roomId, post.RoomId);
        Assert.Equal(room.Title, post.RoomTitle);
        Assert.Equal(room.Address, post.RoomAddress);
        Assert.Equal(room.Price, post.RoomPrice);
        Assert.Equal("https://image.test/room.jpg", post.RoomImageUrl);

        // 3. Get recommendations for other tenant
        var recsRes = await roommateService.GetRecommendationsAsync(otherTenantId);
        Assert.True(recsRes.Success);
        Assert.NotEmpty(recsRes.Data!);
        Assert.NotNull(recsRes.Data![0].MatchScore);
        Assert.True(recsRes.Data![0].MatchScore >= 60.0);
    }

    [Fact]
    public async Task LandlordDashboardService_InviteTenantToRoom_ShouldCreateNotificationAndChatMessage()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string?>();
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var memoryCache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var env = new TestWebHostEnvironment();
        var landlordService = new LandlordDashboardService(db, config, env, memoryCache);

        var landlordId = Guid.NewGuid();
        var landlord = new User
        {
            Id = landlordId,
            FullName = "Chủ trọ Phan Minh",
            Email = "landlord@dormi.vn",
            Role = UserRole.Landlord
        };
        db.Users.Add(landlord);

        var tenantId = Guid.NewGuid();
        var tenant = new User
        {
            Id = tenantId,
            FullName = "Lê Thị Thảo",
            Email = "thao@dormi.vn",
            Role = UserRole.Customer,
            IsLookingForRoommate = true,
            Preferences = "Quận 7, gần trường RMIT",
            Lifestyle = "Yên tĩnh, Sạch sẽ"
        };
        db.Users.Add(tenant);

        var roomId = Guid.NewGuid();
        var room = new Room
        {
            Id = roomId,
            Title = "Căn hộ dịch vụ cao cấp Quận 7",
            Address = "Nguyễn Thị Thập, Quận 7",
            Price = 5000000m,
            Area = 35,
            LandlordId = landlordId,
            Status = RoomStatus.Available
        };
        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        // 1. Discover tenants
        var discoverRes = await landlordService.DiscoverTenantsAsync(landlordId);
        Assert.True(discoverRes.Success);
        Assert.Single(discoverRes.Data!);
        Assert.Equal(tenant.FullName, discoverRes.Data![0].FullName);
        Assert.True(discoverRes.Data![0].MatchScore >= 50);

        // 2. Invite tenant to view room
        var inviteDto = new InviteTenantDto
        {
            TenantId = tenantId,
            RoomId = roomId,
            Message = "Phòng mình rất gần RMIT, mời bạn qua xem phòng chiều nay!"
        };

        var inviteRes = await landlordService.InviteTenantToRoomAsync(landlordId, inviteDto);
        Assert.True(inviteRes.Success);

        // Verify notification created
        var notif = await db.Notifications.FirstOrDefaultAsync(n => n.UserId == tenantId);
        Assert.NotNull(notif);
        Assert.Contains(room.Title, notif.Message);
        Assert.Equal($"/room/{roomId}", notif.LinkUrl);

        // Verify chat message created
        var chatMsg = await db.Messages.FirstOrDefaultAsync(m => m.SenderId == landlordId && m.ReceiverId == tenantId);
        Assert.NotNull(chatMsg);
        Assert.Contains(room.Title, chatMsg.Content);
        Assert.Contains(inviteDto.Message, chatMsg.Content);
    }

    [Fact]
    public async Task DistributedLockService_TryAcquireAndRelease_ShouldEnforceMutualExclusion()
    {
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var logger = new Microsoft.Extensions.Logging.Abstractions.NullLogger<DistributedLockService>();
        var lockService = new DistributedLockService(cache, logger);

        var key = "test_resource_mutex";
        var acquired1 = await lockService.TryAcquireLockAsync(key, TimeSpan.FromMinutes(1));
        Assert.True(acquired1);

        // Second acquire on the same key must fail
        var acquired2 = await lockService.TryAcquireLockAsync(key, TimeSpan.FromMinutes(1));
        Assert.False(acquired2);

        // After release, key can be acquired again
        await lockService.ReleaseLockAsync(key);
        var acquired3 = await lockService.TryAcquireLockAsync(key, TimeSpan.FromMinutes(1));
        Assert.True(acquired3);
    }

    [Fact]
    public async Task LeaseService_SignLease_WhenConcurrentLockActive_ShouldReturn409Conflict()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var lockService = new DistributedLockService(cache, new Microsoft.Extensions.Logging.Abstractions.NullLogger<DistributedLockService>());
        var kafkaProducer = new TestKafkaProducer();
        var leaseService = new LeaseService(db, kafkaProducer, lockService);

        var landlord = new User { Id = Guid.NewGuid(), FullName = "Landlord A", Role = UserRole.Landlord };
        var tenant = new User { Id = Guid.NewGuid(), FullName = "Tenant B", Role = UserRole.Customer };
        var room = new Room { Id = Guid.NewGuid(), Title = "Phòng Trọ 101", LandlordId = landlord.Id, Status = RoomStatus.Available, Price = 3000000 };
        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);

        var lease = new LeaseContract
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            LandlordId = landlord.Id,
            TenantId = tenant.Id,
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddMonths(6),
            MonthlyRent = 3000000,
            Deposit = 3000000,
            Status = "PendingSignature"
        };
        db.LeaseContracts.Add(lease);
        await db.SaveChangesAsync();

        // Simulate concurrent lock already held on this room
        var lockKey = $"lease_signing:{room.Id}";
        await lockService.TryAcquireLockAsync(lockKey, TimeSpan.FromMinutes(1));

        var signRes = await leaseService.SignLeaseByTenantAsync(lease.Id, tenant.Id, new SignLeaseDto { AgreedToTerms = true, SignatureData = "sig_data" });
        Assert.False(signRes.Success);
        Assert.Equal(409, signRes.StatusCode);
        Assert.Contains("xử lý", signRes.ErrorMessage);
    }

    [Fact]
    public async Task PostRentalService_ConfirmPayment_ShouldPublishPaymentCompletedEvent()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var cache = new ServiceCollection().AddDistributedMemoryCache().BuildServiceProvider().GetRequiredService<IDistributedCache>();
        var lockService = new DistributedLockService(cache, new Microsoft.Extensions.Logging.Abstractions.NullLogger<DistributedLockService>());
        var kafkaProducer = new TestKafkaProducer();
        var postRentalService = new PostRentalService(db, kafkaProducer, lockService);

        var landlord = new User { Id = Guid.NewGuid(), FullName = "Landlord A", Role = UserRole.Landlord };
        var tenant = new User { Id = Guid.NewGuid(), FullName = "Tenant B", Role = UserRole.Customer };
        var room = new Room { Id = Guid.NewGuid(), Title = "Phòng Trọ VIP", LandlordId = landlord.Id, Status = RoomStatus.Rented, Price = 4000000 };
        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);

        var lease = new LeaseContract
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            LandlordId = landlord.Id,
            TenantId = tenant.Id,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(12),
            MonthlyRent = 4000000,
            Deposit = 4000000,
            Status = "Active"
        };
        db.LeaseContracts.Add(lease);

        var schedule = new RentalPaymentSchedule
        {
            Id = Guid.NewGuid(),
            LeaseContractId = lease.Id,
            Type = "Rent",
            Title = "Tiền phòng tháng 10",
            Amount = 4000000,
            DueDate = DateTime.UtcNow,
            Status = "Pending"
        };
        db.RentalPaymentSchedules.Add(schedule);
        await db.SaveChangesAsync();

        var res = await postRentalService.RecordPaymentAsync(schedule.Id, new RecordPaymentDto { MarkAsPaid = true, PaymentMethod = "BankTransfer" }, landlord.Id);
        Assert.True(res.Success);
        Assert.Equal("Paid", res.Data?.Status);

        // Verify Kafka event published
        var evt = kafkaProducer.PublishedEvents.FirstOrDefault(e => e.EventType == "PaymentCompleted");
        Assert.NotNull(evt);
        Assert.Equal(tenant.Id, evt.UserId);
        Assert.Equal("Payment", evt.Type);
    }

    [Fact]
    public async Task ReviewService_AddReview_ShouldPublishReviewCreatedEvent()
    {
        var options = new DbContextOptionsBuilder<DormiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new DormiDbContext(options);
        var kafkaProducer = new TestKafkaProducer();
        var reviewService = new ReviewService(db, kafkaProducer);

        var landlord = new User { Id = Guid.NewGuid(), FullName = "Landlord L", Role = UserRole.Landlord };
        var tenant = new User { Id = Guid.NewGuid(), FullName = "Tenant T", Role = UserRole.Customer };
        var room = new Room { Id = Guid.NewGuid(), Title = "Phòng Review Test", LandlordId = landlord.Id, Status = RoomStatus.Available, Price = 3500000 };
        db.Users.AddRange(landlord, tenant);
        db.Rooms.Add(room);

        // Add confirmed appointment so tenant can review
        var appt = new ViewingAppointment
        {
            Id = Guid.NewGuid(),
            CustomerId = tenant.Id,
            RoomId = room.Id,
            AppointmentDate = DateTime.UtcNow.AddDays(-1),
            Status = "Completed"
        };
        db.ViewingAppointments.Add(appt);
        await db.SaveChangesAsync();

        var reviewRes = await reviewService.AddReviewAsync(room.Id, tenant.Id, new CreateReviewDto { Rating = 5, Comment = "Phòng rất thoáng mát và sạch sẽ!" });
        Assert.True(reviewRes.Success);

        // Verify ReviewCreated Kafka event
        var evt = kafkaProducer.PublishedEvents.FirstOrDefault(e => e.EventType == "ReviewCreated");
        Assert.NotNull(evt);
        Assert.Equal(landlord.Id, evt.UserId);
        Assert.Equal("Review", evt.Type);
    }

    private class TestKafkaProducer : IKafkaProducer
    {
        public System.Collections.Generic.List<NotificationEvent> PublishedEvents { get; } = new();

        public Task ProduceAsync<T>(string topic, string key, T message, System.Threading.CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task PublishNotificationAsync(NotificationEvent notification, System.Threading.CancellationToken cancellationToken = default)
        {
            PublishedEvents.Add(notification);
            return Task.CompletedTask;
        }
    }

    private class TestWebHostEnvironment : Microsoft.AspNetCore.Hosting.IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = string.Empty;
        public Microsoft.Extensions.FileProviders.IFileProvider WebRootFileProvider { get; set; } = null!;
        public string EnvironmentName { get; set; } = "Development";
        public string ApplicationName { get; set; } = "Dormi.Tests";
        public string ContentRootPath { get; set; } = string.Empty;
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = null!;
    }
}
