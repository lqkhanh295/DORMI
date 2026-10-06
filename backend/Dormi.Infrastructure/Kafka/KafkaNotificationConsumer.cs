using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Confluent.Kafka;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Dormi.Infrastructure.Kafka;

public class KafkaNotificationConsumer : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly KafkaOptions _options;
    private readonly ILogger<KafkaNotificationConsumer> _logger;
    private readonly IHubContext<ChatHub> _hubContext;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public KafkaNotificationConsumer(
        IServiceScopeFactory scopeFactory,
        IOptions<KafkaOptions> options,
        ILogger<KafkaNotificationConsumer> logger,
        IHubContext<ChatHub> hubContext)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("[KafkaConsumer] Kafka is disabled via configuration. Consumer worker will remain idle.");
            return;
        }

        // Wait a few seconds on startup to let the broker establish connections
        await Task.Delay(3000, stoppingToken);

        var topic = string.IsNullOrWhiteSpace(_options.NotificationTopic)
            ? KafkaTopics.Notifications
            : _options.NotificationTopic;

        var config = new ConsumerConfig
        {
            BootstrapServers = _options.BootstrapServers,
            GroupId = string.IsNullOrWhiteSpace(_options.GroupId) ? "dormi-notification-consumer" : _options.GroupId,
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false,
            EnableAutoOffsetStore = false,
            SessionTimeoutMs = 15000,
            SocketTimeoutMs = 10000
        };

        _logger.LogInformation("[KafkaConsumer] Initializing Kafka consumer for topic {Topic} at {Broker} with group {Group}",
            topic, _options.BootstrapServers, config.GroupId);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var consumer = new ConsumerBuilder<string, string>(config)
                    .SetErrorHandler((_, e) =>
                    {
                        if (e.IsFatal)
                        {
                            _logger.LogError("[KafkaConsumer] Fatal error: {Reason}", e.Reason);
                        }
                        else
                        {
                            _logger.LogWarning("[KafkaConsumer] Non-fatal notice: {Reason}", e.Reason);
                        }
                    })
                    .Build();

                consumer.Subscribe(topic);
                _logger.LogInformation("[KafkaConsumer] Subscribed to topic {Topic}. Waiting for events...", topic);

                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        // Consume with a short timeout to check cancellationToken periodically
                        var consumeResult = consumer.Consume(TimeSpan.FromSeconds(2));
                        if (consumeResult == null || consumeResult.IsPartitionEOF)
                        {
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(consumeResult.Message?.Value))
                        {
                            consumer.StoreOffset(consumeResult);
                            consumer.Commit(consumeResult);
                            continue;
                        }

                        _logger.LogInformation("[KafkaConsumer] Received event on {Topic} [P:{Partition}, O:{Offset}]: {Key}",
                            consumeResult.Topic, consumeResult.Partition.Value, consumeResult.Offset.Value, consumeResult.Message.Key);

                        await ProcessEventAsync(consumeResult.Message.Value, stoppingToken);

                        // Manual offset store & commit for at-least-once delivery
                        consumer.StoreOffset(consumeResult);
                        consumer.Commit(consumeResult);
                    }
                    catch (ConsumeException cx)
                    {
                        _logger.LogWarning(cx, "[KafkaConsumer] Consume exception: {Reason}. Will retry.", cx.Error.Reason);
                        await Task.Delay(2000, stoppingToken);
                    }
                    catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                    {
                        break;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[KafkaConsumer] Unexpected error processing Kafka message.");
                        await Task.Delay(2000, stoppingToken);
                    }
                }

                try
                {
                    consumer.Close();
                }
                catch
                {
                    // Suppress close error on shutdown
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // ponytail: broker connection retry loop. If Kafka is down, consumer logs and backs off 10s without terminating web API host.
                _logger.LogWarning("[KafkaConsumer] Failed to connect to Kafka broker ({Broker}): {Message}. Retrying in 10s...",
                    _options.BootstrapServers, ex.Message);

                try
                {
                    await Task.Delay(10000, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        _logger.LogInformation("[KafkaConsumer] Kafka consumer worker stopped.");
    }

    private async Task ProcessEventAsync(string jsonPayload, CancellationToken ct)
    {
        NotificationEvent? evt = null;
        try
        {
            evt = JsonSerializer.Deserialize<NotificationEvent>(jsonPayload, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[KafkaConsumer] Failed to deserialize JSON into NotificationEvent: {Payload}", jsonPayload);
            return;
        }

        if (evt == null) return;

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DormiDbContext>();

        // 1. Idempotent notification persistence (skip for security OTP events)
        if (evt.UserId.HasValue && evt.UserId.Value != Guid.Empty && evt.EventType != "PasswordResetOtp")
        {
            var alreadyExists = await db.Notifications.AnyAsync(n => n.Id == evt.Id, ct);
            if (!alreadyExists)
            {
                var notification = new Notification
                {
                    Id = evt.Id,
                    UserId = evt.UserId.Value,
                    Title = evt.Title,
                    Message = evt.Message,
                    Type = string.IsNullOrWhiteSpace(evt.Type) ? "System" : evt.Type,
                    LinkUrl = evt.LinkUrl,
                    IsRead = false,
                    CreatedAt = evt.CreatedAt != default ? evt.CreatedAt : DateTime.UtcNow
                };

                db.Notifications.Add(notification);
                await db.SaveChangesAsync(ct);
                _logger.LogInformation("[KafkaConsumer] Persisted notification {Id} for user {UserId} (type: {Type})",
                    notification.Id, notification.UserId, notification.Type);
            }
        }

        // 2. Real-time push via SignalR (skip for security OTP events)
        try
        {
            if (evt.UserId.HasValue && evt.EventType != "PasswordResetOtp")
            {
                var userGroup = evt.UserId.Value.ToString().ToLower();
                await _hubContext.Clients.Group(userGroup).SendAsync("ReceiveNotification", new
                {
                    id = evt.Id,
                    userId = evt.UserId.Value,
                    title = evt.Title,
                    message = evt.Message,
                    type = evt.Type,
                    linkUrl = evt.LinkUrl,
                    createdAt = evt.CreatedAt
                }, ct);
            }

            // Specific event handler routing
            switch (evt.EventType)
            {
                case "PasswordResetOtp":
                    // ponytail: AuthService already sends OTP email directly to ensure instant delivery. Kafka event is consumed for audit logging only.
                    _logger.LogInformation("[KafkaConsumer] Audited PasswordResetOtp event for user {UserId}", evt.UserId);
                    break;

                case "NewRoomPendingApproval":
                case "RoomPendingApproval":
                    await _hubContext.Clients.Group("admins").SendAsync("NewRoomPendingApproval", evt.Metadata ?? (object)new
                    {
                        roomId = evt.Id,
                        title = evt.Title,
                        createdAt = evt.CreatedAt
                    }, ct);
                    break;

                case "RoomStatusUpdated":
                    if (evt.Metadata != null)
                    {
                        if (evt.UserId.HasValue)
                        {
                            await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                                .SendAsync("RoomStatusUpdated", evt.Metadata, ct);
                        }
                        await _hubContext.Clients.Group("admins").SendAsync("RoomModerated", evt.Metadata, ct);
                        await _hubContext.Clients.All.SendAsync("RoomStatusChanged", evt.Metadata, ct);
                    }
                    break;

                case "AppointmentCreated":
                case "ViewingRequested":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("AppointmentReceived", evt.Metadata, ct);
                    }
                    break;

                case "AppointmentStatusUpdated":
                case "ViewingConfirmed":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("AppointmentStatusUpdated", evt.Metadata, ct);
                    }
                    break;

                case "ApplicationSubmitted":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("ApplicationReceived", evt.Metadata, ct);
                    }
                    break;

                case "ApplicationApproved":
                case "ApplicationStatusUpdated":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("ApplicationStatusUpdated", evt.Metadata, ct);
                    }
                    break;

                case "LeasePendingSignature":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("LeasePendingSignature", evt.Metadata, ct);
                    }
                    break;

                case "LeaseActivated":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("LeaseActivated", evt.Metadata, ct);
                    }
                    break;

                case "PaymentCompleted":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("PaymentReceived", evt.Metadata, ct);
                    }
                    break;

                case "MaintenanceCreated":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("MaintenanceReceived", evt.Metadata, ct);
                    }
                    break;

                case "MaintenanceStatusUpdated":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("MaintenanceStatusUpdated", evt.Metadata, ct);
                    }
                    break;

                case "MoveOutRequested":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("MoveOutReceived", evt.Metadata, ct);
                    }
                    break;

                case "MoveOutSettled":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("MoveOutSettled", evt.Metadata, ct);
                    }
                    break;

                case "ReviewCreated":
                    if (evt.UserId.HasValue && evt.Metadata != null)
                    {
                        await _hubContext.Clients.Group(evt.UserId.Value.ToString().ToLower())
                            .SendAsync("ReviewReceived", evt.Metadata, ct);
                    }
                    break;
            }

            // 3. Immutable audit trail persistence for critical contract & financial actions
            if (evt.EventType is "LeaseActivated" or "PaymentCompleted" or "MoveOutSettled")
            {
                var entityId = evt.Metadata?.GetValueOrDefault("leaseId")?.ToString()
                    ?? evt.Metadata?.GetValueOrDefault("paymentId")?.ToString()
                    ?? evt.Id.ToString();

                db.AuditLogs.Add(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    ActorId = evt.UserId,
                    ActorEmail = "transaction-engine@dormi.space",
                    Action = evt.EventType,
                    EntityType = evt.Type ?? "Transaction",
                    EntityId = entityId,
                    Details = evt.Message,
                    CreatedAt = DateTime.UtcNow
                });
                await db.SaveChangesAsync(ct);
                _logger.LogInformation("[KafkaConsumer] Audit trail recorded for {EventType} (EntityId: {EntityId})", evt.EventType, entityId);
            }
        }
        catch (Exception ex)
        {
            // Real-time notification dispatch error should not rollback Kafka commit
            _logger.LogWarning(ex, "[KafkaConsumer] SignalR broadcast encountered an error for event {EventType}", evt.EventType);
        }
    }
}
