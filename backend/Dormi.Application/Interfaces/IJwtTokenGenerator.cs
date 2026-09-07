using Dormi.Domain.Entities;

namespace Dormi.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
