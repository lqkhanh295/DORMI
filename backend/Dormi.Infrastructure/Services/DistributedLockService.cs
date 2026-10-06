using System;
using System.Threading.Tasks;
using Dormi.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace Dormi.Infrastructure.Services;

// ponytail: DistributedLockService provides lightweight concurrency guards using IDistributedCache with TTL.
// Upgrade path: RedLock.net multi-instance quorum if cluster scaling requires atomic cross-shard locking.
public class DistributedLockService : IDistributedLockService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<DistributedLockService> _logger;

    public DistributedLockService(IDistributedCache cache, ILogger<DistributedLockService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<bool> TryAcquireLockAsync(string resourceKey, TimeSpan ttl)
    {
        var lockKey = $"dormi_lock:{resourceKey}";
        try
        {
            var existing = await _cache.GetStringAsync(lockKey);
            if (!string.IsNullOrEmpty(existing))
            {
                _logger.LogDebug("[DistributedLock] Resource {Key} is currently locked by {Owner}", resourceKey, existing);
                return false;
            }

            var lockValue = $"{Environment.MachineName}:{Guid.NewGuid():N}";
            await _cache.SetStringAsync(lockKey, lockValue, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            });

            return true;
        }
        catch (Exception ex)
        {
            // ponytail: If cache fails, log warning and fail-open to not block critical user transaction.
            _logger.LogWarning(ex, "[DistributedLock] Error checking lock for key {Key}. Failing open.", resourceKey);
            return true;
        }
    }

    public async Task ReleaseLockAsync(string resourceKey)
    {
        var lockKey = $"dormi_lock:{resourceKey}";
        try
        {
            await _cache.RemoveAsync(lockKey);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[DistributedLock] Failed to release lock for key {Key}", resourceKey);
        }
    }
}
