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
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        services.AddDbContext<DormiDbContext>(options =>
        {
            if (useInMemory)
            {
                options.UseInMemoryDatabase("DORMI_DB");
            }
            else
            {
                try
                {
                    options.UseNpgsql(connectionString, x => x.UseNetTopologySuite());
                }
                catch
                {
                    options.UseInMemoryDatabase("DORMI_DB");
                }
            }
        });

        // Register Distributed Cache (Redis with in-memory fallback for local resilience)
        var redisConn = configuration.GetConnectionString("Redis");
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
}

