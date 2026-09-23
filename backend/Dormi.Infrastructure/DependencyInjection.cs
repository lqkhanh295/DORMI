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

        // Register Core Infrastructure Services
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
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ITenantReviewService, TenantReviewService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
