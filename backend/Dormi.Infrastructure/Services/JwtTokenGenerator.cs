using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Dormi.Infrastructure.Services;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _config;

    public JwtTokenGenerator(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(User user)
    {
        var secretKey = _config["JwtSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
        {
            secretKey = _config["JWT_SECRET_KEY"] 
                ?? _config["JWT_SECRET"]
                ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                ?? Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? "DormiSuperSecretKeyForJWTAuthentication2026!#$SafeProductionResilienceKey";
        }
        var issuer = _config["JwtSettings:Issuer"] ?? "DormiAPI";
        var audience = _config["JwtSettings:Audience"] ?? "DormiUsers";
        var expiryMinutes = int.TryParse(_config["JwtSettings:ExpiryMinutes"], out var exp) ? exp : 1440;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
