using Dormi.Application.Interfaces;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dormi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var useInMemory = configuration.GetValue<bool>("UseInMemoryDatabase");
        var connectionString = ResolveConnectionString(configuration);
        
        services.AddDbContext<DormiDbContext>(options =>
        {
            if (useInMemory || string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseInMemoryDatabase("DORMI_DB");
            }
            else
            {
                try
                {
                    options.UseNpgsql(connectionString, npgsqlOptions =>
                    {
                        npgsqlOptions.UseNetTopologySuite();
                        npgsqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(2),
                            errorCodesToAdd: null);
                        npgsqlOptions.CommandTimeout(30);
                    });
                }
                catch
                {
                    options.UseInMemoryDatabase("DORMI_DB");
                }
            }
        });

        // Register Distributed Cache (Redis with in-memory fallback for local resilience)
        var redisConn = configuration.GetConnectionString("Redis");
        if (string.IsNullOrWhiteSpace(redisConn) || redisConn == "localhost:6379")
        {
            var envRedis = configuration["REDIS_URL"] 
                ?? Environment.GetEnvironmentVariable("REDIS_URL");
            if (!string.IsNullOrWhiteSpace(envRedis))
            {
                redisConn = envRedis;
            }
        }

        var redisAvailable = false;
        if (!string.IsNullOrEmpty(redisConn))
        {
            try
            {
                var redisOptions = StackExchange.Redis.ConfigurationOptions.Parse(redisConn);
                redisOptions.ConnectTimeout = 1000;
                redisOptions.SyncTimeout = 1000;
                redisOptions.AbortOnConnectFail = true;
                using var testConn = StackExchange.Redis.ConnectionMultiplexer.Connect(redisOptions);
                redisAvailable = testConn.IsConnected;
            }
            catch
            {
                redisAvailable = false;
            }
        }

        if (redisAvailable)
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConn;
                options.InstanceName = "Dormi_";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        // Register Core Infrastructure Services
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IImageService, CloudinaryService>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        // Register Application Business Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<ILandlordDashboardService, LandlordDashboardService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IRoommateService, RoommateService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IRentalApplicationService, RentalApplicationService>();
        services.AddScoped<ILeaseService, LeaseService>();
        services.AddScoped<IPostRentalService, PostRentalService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ITenantReviewService, TenantReviewService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ITrustSafetyService, TrustSafetyService>();
        services.AddScoped<IDistributedLockService, DistributedLockService>();

        // Register Apache Kafka Messaging (Event streaming & Notification Consumer)
        services.Configure<Dormi.Infrastructure.Kafka.KafkaOptions>(configuration.GetSection(Dormi.Infrastructure.Kafka.KafkaOptions.SectionName));
        services.AddSingleton<IKafkaProducer, Dormi.Infrastructure.Kafka.KafkaProducer>();
        services.AddHostedService<Dormi.Infrastructure.Kafka.KafkaNotificationConsumer>();

        return services;
    }

    private static string ResolveConnectionString(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            var dbUrl = configuration["DATABASE_URL"] 
                ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? configuration["POSTGRES_URL"]
                ?? Environment.GetEnvironmentVariable("POSTGRES_URL");

            if (!string.IsNullOrWhiteSpace(dbUrl))
            {
                connectionString = ConvertDatabaseUrlToNpgsql(dbUrl);
            }
        }

        if (!string.IsNullOrWhiteSpace(connectionString) && !connectionString.Contains("Keepalive", StringComparison.OrdinalIgnoreCase))
        {
            var separator = connectionString.TrimEnd().EndsWith(";") ? "" : ";";
            connectionString += $"{separator}Keepalive=30;Pooling=true;Minimum Pool Size=1;Maximum Pool Size=20;Connection Idle Lifetime=60;Timeout=15;Command Timeout=30;";
        }

        return connectionString ?? string.Empty;
    }

    private static string ConvertDatabaseUrlToNpgsql(string databaseUrl)
    {
        if (!databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return databaseUrl;
        }

        try
        {
            var uri = new Uri(databaseUrl);
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var database = uri.AbsolutePath.TrimStart('/');
            var port = uri.Port > 0 ? uri.Port : 5432;

            return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;Keepalive=30;Pooling=true;Minimum Pool Size=1;Maximum Pool Size=20;Connection Idle Lifetime=60;Timeout=15;Command Timeout=30;";
        }
        catch
        {
            return databaseUrl;
        }
    }
}

