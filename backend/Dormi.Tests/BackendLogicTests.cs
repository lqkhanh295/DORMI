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

        double score = Dormi.API.Controllers.RoommatesController.CalculateMatchScore(userTraits, candidateTraits);
        
        Assert.True(score >= 60.0 && score <= 100.0);

        double emptyScore = Dormi.API.Controllers.RoommatesController.CalculateMatchScore("", "");
        Assert.Equal(75.0, emptyScore);
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
}
