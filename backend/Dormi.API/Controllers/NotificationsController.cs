using System;
using System.Threading.Tasks;
using Dormi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _notificationService.GetNotificationsAsync(userId.Value);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _notificationService.MarkAsReadAsync(id, userId.Value);
        return HandleResult(result);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _notificationService.MarkAllAsReadAsync(userId.Value);
        return HandleResult(result);
    }

    /// <summary>
    /// Endpoint kiểm tra đẩy sự kiện vào Apache Kafka và kích hoạt Consumer xử lý bất đồng bộ
    /// </summary>
    [HttpPost("test-kafka")]
    [AllowAnonymous]
    public async Task<IActionResult> TestKafkaPublish([FromServices] IKafkaProducer kafkaProducer, [FromBody] KafkaTestRequest? request)
    {
        var userId = GetCurrentUserId() ?? Guid.NewGuid();
        var evt = new Dormi.Application.DTOs.NotificationEvent
        {
            Id = Guid.NewGuid(),
            EventType = "TestKafkaEvent",
            UserId = userId,
            Title = request?.Title ?? "Thông báo thử nghiệm Kafka",
            Message = request?.Message ?? "Sự kiện kiểm tra kết nối Apache Kafka trong Dormi đã được xử lý bất đồng bộ thành công!",
            Type = "System",
            LinkUrl = "/notifications",
            CreatedAt = DateTime.UtcNow
        };

        await kafkaProducer.PublishNotificationAsync(evt);
        return Ok(new
        {
            success = true,
            message = "Đã gửi sự kiện kiểm tra vào Apache Kafka topic.",
            eventId = evt.Id,
            topic = "dormi.notifications"
        });
    }
}

public record KafkaTestRequest(string? Title, string? Message);
