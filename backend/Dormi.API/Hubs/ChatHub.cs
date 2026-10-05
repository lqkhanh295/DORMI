using Microsoft.Extensions.Caching.Distributed;

namespace Dormi.API.Hubs;

// Alias to Infrastructure ChatHub for compatibility
public class ChatHub : Dormi.Infrastructure.Hubs.ChatHub
{
    public ChatHub(IDistributedCache? cache = null) : base(cache)
    {
    }
}
