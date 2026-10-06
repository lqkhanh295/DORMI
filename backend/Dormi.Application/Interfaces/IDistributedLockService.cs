using System;
using System.Threading.Tasks;

namespace Dormi.Application.Interfaces;

public interface IDistributedLockService
{
    Task<bool> TryAcquireLockAsync(string resourceKey, TimeSpan ttl);
    Task ReleaseLockAsync(string resourceKey);
}
