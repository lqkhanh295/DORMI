using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Dormi.API.Hubs;

public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId.ToLower());
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
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.ToLower());
        }

        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) || Context.User?.IsInRole("Admin") == true)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Explicit group joiners for authenticated or role-verified clients
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
