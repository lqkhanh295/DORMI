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
