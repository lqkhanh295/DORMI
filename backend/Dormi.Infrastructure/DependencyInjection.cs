using Dormi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dormi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<DormiDbContext>(options =>
            options.UseNpgsql(connectionString, x => x.UseNetTopologySuite()));

        services.AddScoped<Dormi.Application.Interfaces.IImageService, Dormi.Infrastructure.Services.CloudinaryService>();

        return services;
    }
}
