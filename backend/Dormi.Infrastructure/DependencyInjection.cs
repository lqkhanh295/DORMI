using Dormi.Infrastructure.Data;
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

        services.AddScoped<Dormi.Application.Interfaces.IImageService, Dormi.Infrastructure.Services.CloudinaryService>();
        services.AddScoped<Dormi.Application.Interfaces.IJwtTokenGenerator, Dormi.Infrastructure.Services.JwtTokenGenerator>();

        return services;
    }
}
