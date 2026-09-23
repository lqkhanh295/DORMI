using System;
using System.Security.Claims;
using Dormi.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid? GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : null;
    }

    protected string? GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }

    protected bool IsAdmin()
    {
        return string.Equals(GetCurrentUserRole(), "Admin", StringComparison.OrdinalIgnoreCase) 
               || User.IsInRole("Admin");
    }

    protected IActionResult HandleResult<T>(ServiceResult<T> result)
    {
        if (result == null) return NotFound();
        if (result.Success)
        {
            return StatusCode(result.StatusCode, result.Data);
        }

        return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
    }

    protected IActionResult HandleResult(ServiceResult result)
    {
        if (result == null) return NotFound();
        if (result.Success)
        {
            return StatusCode(result.StatusCode);
        }

        return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
    }
}
