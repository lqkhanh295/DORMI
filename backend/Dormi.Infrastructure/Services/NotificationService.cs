using System;
using System.Linq;
using System.Threading.Tasks;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dormi.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly DormiDbContext _db;

    public NotificationService(DormiDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<object>> GetNotificationsAsync(Guid userId)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                LinkUrl = n.LinkUrl,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        var unreadCount = notifications.Count(n => !n.IsRead);

        return ServiceResult<object>.Ok(new
        {
            unreadCount = unreadCount,
            notifications = notifications
        });
    }

    public async Task<ServiceResult<object>> MarkAsReadAsync(Guid id, Guid userId)
    {
        var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (notification == null) return ServiceResult<object>.NotFound("Không tìm thấy thông báo.");

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { message = "Đã đánh dấu thông báo là đã đọc." });
    }

    public async Task<ServiceResult<object>> MarkAllAsReadAsync(Guid userId)
    {
        var unreadNotifications = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unreadNotifications)
        {
            n.IsRead = true;
        }

        await _db.SaveChangesAsync();
        return ServiceResult<object>.Ok(new { message = "Đã đánh dấu tất cả thông báo là đã đọc." });
    }
}
