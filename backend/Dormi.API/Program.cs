using System.Text;
using Dormi.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

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
var secretKey = builder.Configuration["JwtSettings:SecretKey"] ?? "DormiSuperSecretKeyForJWTAuthentication2026!#$";
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

// 5. Configure CORS (allow credentials for SignalR WebSockets)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Dormi API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<Dormi.API.Hubs.ChatHub>("/hubs/chat");

// Seed initial database
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<Dormi.Infrastructure.Data.DormiDbContext>();
    await Dormi.Infrastructure.Data.DbSeeder.SeedAsync(db);
}
catch (Exception ex)
{
    Console.WriteLine($"[Database Seeding Notice]: {ex.Message}");
}

app.Run();
