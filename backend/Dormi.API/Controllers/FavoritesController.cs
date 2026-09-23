using System;
using System.Threading.Tasks;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : BaseApiController
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _favoriteService.GetFavoritesAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPost("{roomId:guid}")]
    public async Task<IActionResult> AddFavorite(Guid roomId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _favoriteService.AddFavoriteAsync(userId.Value, roomId);
        return HandleResult(result);
    }

    [HttpDelete("{roomId:guid}")]
    public async Task<IActionResult> RemoveFavorite(Guid roomId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _favoriteService.RemoveFavoriteAsync(userId.Value, roomId);
        return HandleResult(result);
    }
}
