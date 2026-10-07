using System.Text;
using Dormi.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// ponytail: load optional local secrets file (gitignored)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: false);

// Configure 50MB max body length limit for uploading images
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800;
    options.ValueLengthLimit = 52428800;
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 52428800;
});

// 1. Add Infrastructure (DbContext, Services, Cloudinary, JwtTokenGenerator)
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Add Controllers, SignalR & MemoryCache
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();

// 3. Configure JWT Authentication
var secretKey = builder.Configuration["JwtSettings:SecretKey"];
if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
{
    secretKey = builder.Configuration["JWT_SECRET_KEY"] 
        ?? builder.Configuration["JWT_SECRET"]
        ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? Environment.GetEnvironmentVariable("JWT_SECRET")
        ?? "DormiSuperSecretKeyForJWTAuthentication2026!#$SafeProductionResilienceKey";
}
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "DormiAPI";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "DormiUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };

    // Support SignalR token passing in query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// 4. Configure Swagger / OpenAPI with Bearer Authorization support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Dormi API", Version = "v1", Description = "API Backend cho Nền tảng Tìm & Quản lý Phòng trọ Dormi" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT Bearer token theo cú pháp: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement((doc) => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });
});

// 5. Configure CORS with strict development & production origin whitelisting
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[]
{
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://dormi.space",
    "https://www.dormi.space"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDormiOrigins", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  try
                  {
                      var uri = new Uri(origin);
                      return uri.Host == "localhost" || 
                             uri.Host == "127.0.0.1" || 
                             uri.Host == "dormi.space" ||
                             uri.Host == "www.dormi.space" ||
                             allowedOrigins.Contains(origin);
                  }
                  catch
                  {
                      return false;
                  }
              })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Global Exception Handling to shield client from raw stack traces
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var ex = exceptionHandlerPathFeature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "[GLOBAL EXCEPTION] Unhandled error at {Path}", context.Request.Path);

        var exMsg = ex?.Message ?? "Internal Server Error";
        if (ex?.InnerException != null)
        {
            exMsg += $" -> {ex.InnerException.Message}";
        }

        var showDetails = app.Environment.IsDevelopment() 
            || app.Configuration.GetValue<bool>("ShowDetailedErrors")
            || context.Request.Headers.ContainsKey("X-Debug-Error");

        await context.Response.WriteAsJsonAsync(new
        {
            success = false,
            message = showDetails ? $"Lỗi hệ thống: {exMsg}" : "Đã xảy ra lỗi không mong muốn trên hệ thống. Vui lòng thử lại sau.",
            error = ex?.GetType().Name,
            detail = showDetails ? exMsg : null,
            statusCode = 500
        });
    });
});

// Forwarded Headers for reverse proxy
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

// Configure Swagger / OpenAPI (only in Development or when EnableSwagger=true)
if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwagger"))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Dormi API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowDormiOrigins");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new { status = "healthy", service = "Dormi API", timestamp = DateTime.UtcNow }));

app.MapGet("/health", async (Dormi.Infrastructure.Data.DormiDbContext db, Microsoft.Extensions.Caching.Distributed.IDistributedCache cache) =>
{
    var dbHealthy = false;
    var redisHealthy = false;
    string? dbError = null;
    string? redisError = null;

    try
    {
        dbHealthy = await db.Database.CanConnectAsync();
    }
    catch (Exception ex)
    {
        dbError = ex.Message;
    }

    try
    {
        await cache.SetStringAsync("health_check_probe", "ok", new Microsoft.Extensions.Caching.Distributed.DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(10)
        });
        redisHealthy = (await cache.GetStringAsync("health_check_probe")) == "ok";
    }
    catch (Exception ex)
    {
        redisError = ex.Message;
    }

    var overallHealthy = dbHealthy;

    return Results.Json(new
    {
        status = overallHealthy ? "healthy" : "degraded",
        timestamp = DateTime.UtcNow,
        service = "Dormi API",
        components = new
        {
            database = dbHealthy ? "connected" : $"unreachable ({dbError})",
            cache = redisHealthy ? "active" : $"fallback_memory ({redisError})"
        }
    }, statusCode: overallHealthy ? 200 : 503);
});
app.MapControllers();
app.MapHub<Dormi.API.Hubs.ChatHub>("/hubs/chat");

// 1. ALWAYS Ensure database schema and tables exist in ALL environments (including Production)
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<Dormi.Infrastructure.Data.DormiDbContext>();
    await Dormi.Infrastructure.Data.DbSeeder.EnsureSchemaAsync(db);

    // 2. Seed mock data only in Development or when explicitly configured
    if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("SeedData"))
    {
        await Dormi.Infrastructure.Data.DbSeeder.SeedMockDataAsync(db);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[Database Initialization Error]: {ex.Message}");
    var logger = app.Services.GetService<ILogger<Program>>();
    logger?.LogError(ex, "Failed to initialize database schema or seed data");
}

app.Run();
