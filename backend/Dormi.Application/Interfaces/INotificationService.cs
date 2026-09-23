using System;
using System.Threading.Tasks;
using Dormi.Application.Common;

namespace Dormi.Application.Interfaces;

public interface INotificationService
{
    Task<ServiceResult<object>> GetNotificationsAsync(Guid userId);
    Task<ServiceResult<object>> MarkAsReadAsync(Guid id, Guid userId);
    Task<ServiceResult<object>> MarkAllAsReadAsync(Guid userId);
}
