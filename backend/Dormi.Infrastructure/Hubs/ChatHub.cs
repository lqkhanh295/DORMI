using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;

namespace Dormi.Infrastructure.Hubs;

public class ChatHub : Hub
{
    private readonly IDistributedCache? _cache;

    public ChatHub(IDistributedCache? cache = null)
    {
        _cache = cache;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var normalizedUserId = userId.ToLower();
            await Groups.AddToGroupAsync(Context.ConnectionId, normalizedUserId);
            if (_cache != null)
            {
                await _cache.SetStringAsync($"presence:{normalizedUserId}", "online", new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
                });
            }
        }

        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) || Context.User?.IsInRole("Admin") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var normalizedUserId = userId.ToLower();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, normalizedUserId);
            if (_cache != null)
            {
                await _cache.RemoveAsync($"presence:{normalizedUserId}");
            }
        }

        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) || Context.User?.IsInRole("Admin") == true)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task Heartbeat()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId) && _cache != null)
        {
            await _cache.SetStringAsync($"presence:{userId.ToLower()}", "online", new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
            });
        }
    }

    public async Task JoinUserGroup(string userId)
    {
        var currentUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(currentUserId) && string.Equals(currentUserId, userId, StringComparison.OrdinalIgnoreCase))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, currentUserId.ToLower());
        }
    }

    public async Task JoinAdminGroup()
    {
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) || Context.User?.IsInRole("Admin") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
        }
    }
}
