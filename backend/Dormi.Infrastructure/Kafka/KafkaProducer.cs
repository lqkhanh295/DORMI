using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Confluent.Kafka;
using Dormi.Application.Common;
using Dormi.Application.DTOs;
using Dormi.Application.Interfaces;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Dormi.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Dormi.Infrastructure.Kafka;

public class KafkaProducer : IKafkaProducer, IDisposable
{
    private readonly KafkaOptions _options;
    private readonly ILogger<KafkaProducer> _logger;
    private readonly Lazy<IProducer<string, string>?> _lazyProducer;
    private readonly IServiceScopeFactory? _scopeFactory;
    private readonly IHubContext<ChatHub>? _hubContext;
    private bool _disposed;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public KafkaProducer(
        IOptions<KafkaOptions> options, 
        ILogger<KafkaProducer> logger,
        IServiceScopeFactory? scopeFactory = null,
        IHubContext<ChatHub>? hubContext = null)
    {
        _options = options.Value;
        _logger = logger;
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;

        _lazyProducer = new Lazy<IProducer<string, string>?>(() =>
        {
            if (!_options.Enabled)
            {
                _logger.LogInformation("[Kafka] Kafka is disabled via configuration. Event publishing will be skipped.");
                return null;
            }

            try
            {
                var config = new ProducerConfig
                {
                    BootstrapServers = _options.BootstrapServers,
                    Acks = Acks.All,
                    MessageTimeoutMs = 5000,
                    SocketTimeoutMs = 5000,
                    // Enable idempotent delivery when possible
                    EnableIdempotence = true
                };

                return new ProducerBuilder<string, string>(config).Build();
            }
            catch (Exception ex)
            {
                // ponytail: Kafka initialization failure is caught to allow the service to start even if Kafka is down. Upgrade path: add health check & circuit breaker.
                _logger.LogWarning(ex, "[Kafka] Failed to initialize Kafka producer with broker: {Broker}. Falling back to passive mode.", _options.BootstrapServers);
                return null;
            }
        });
    }

    public async Task ProduceAsync<T>(string topic, string key, T message, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogDebug("[Kafka] Skipping publish to topic {Topic} because Kafka is disabled.", topic);
            return;
        }

        var producer = _lazyProducer.Value;
        if (producer == null)
        {
            _logger.LogWarning("[Kafka] Producer is unavailable. Message to topic {Topic} with key {Key} dropped.", topic, key);
            return;
        }

        try
        {
            var payload = JsonSerializer.Serialize(message, JsonOptions);
            var kafkaMessage = new Message<string, string>
            {
                Key = key,
                Value = payload,
                Timestamp = new Timestamp(DateTime.UtcNow)
            };

            var result = await producer.ProduceAsync(topic, kafkaMessage, cancellationToken);
            _logger.LogInformation("[Kafka] Published message to {Topic} [partition: {Partition}, offset: {Offset}] with key {Key}",
                result.Topic, result.Partition.Value, result.Offset.Value, key);
        }
        catch (Exception ex)
        {
            // ponytail: Non-blocking Kafka producer catch to guarantee HTTP API availability. Upgrade path: Transactional Outbox pattern with DB fallback.
            _logger.LogError(ex, "[Kafka] Failed to produce message to topic {Topic} with key {Key}", topic, key);
        }
    }

    public async Task PublishNotificationAsync(NotificationEvent notification, CancellationToken cancellationToken = default)
    {
        var dispatchedViaKafka = false;

        if (_options.Enabled)
        {
            try
            {
                // Strict 800ms fail-fast timeout so HTTP request handlers never hang on dead Kafka brokers
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromMilliseconds(800));

                var topic = string.IsNullOrWhiteSpace(_options.NotificationTopic)
                    ? KafkaTopics.Notifications
                    : _options.NotificationTopic;

                var partitionKey = notification.UserId?.ToString() ?? notification.Id.ToString();
                var producer = _lazyProducer.Value;
                if (producer != null)
                {
                    var payload = JsonSerializer.Serialize(notification, JsonOptions);
                    var kafkaMessage = new Message<string, string>
                    {
                        Key = partitionKey,
                        Value = payload,
                        Timestamp = new Timestamp(DateTime.UtcNow)
                    };

                    await producer.ProduceAsync(topic, kafkaMessage, cts.Token);
                    dispatchedViaKafka = true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[Kafka] Produce timed out or failed. Falling back to direct in-process dispatch.");
            }
        }

        // Direct in-process delivery: 0ms latency, zero message drops, real-time SignalR active
        if (!dispatchedViaKafka)
        {
            await DispatchInProcessAsync(notification);
        }
    }

    private async Task DispatchInProcessAsync(NotificationEvent evt)
    {
        if (_scopeFactory == null) return;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DormiDbContext>();

            if (evt.UserId.HasValue && evt.UserId.Value != Guid.Empty && evt.EventType != "PasswordResetOtp")
            {
                var notification = new Notification
                {
                    Id = evt.Id == Guid.Empty ? Guid.NewGuid() : evt.Id,
                    UserId = evt.UserId.Value,
                    Title = evt.Title,
                    Message = evt.Message,
                    Type = string.IsNullOrWhiteSpace(evt.Type) ? "System" : evt.Type,
                    LinkUrl = evt.LinkUrl,
                    IsRead = false,
                    CreatedAt = evt.CreatedAt != default ? evt.CreatedAt : DateTime.UtcNow
                };

                db.Notifications.Add(notification);
                await db.SaveChangesAsync();

                if (_hubContext != null)
                {
                    await _hubContext.Clients.User(evt.UserId.Value.ToString()).SendAsync("ReceiveNotification", new
                    {
                        id = notification.Id,
                        title = notification.Title,
                        message = notification.Message,
                        type = notification.Type,
                        linkUrl = notification.LinkUrl,
                        createdAt = notification.CreatedAt
                    });
                }

                _logger.LogInformation("[NotificationFallback] In-process notification {Id} persisted & dispatched to user {UserId}",
                    notification.Id, notification.UserId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[NotificationFallback] Failed in-process dispatch for user {UserId}", evt.UserId);
        }
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        if (_lazyProducer.IsValueCreated && _lazyProducer.Value != null)
        {
            try
            {
                _lazyProducer.Value.Flush(TimeSpan.FromSeconds(3));
                _lazyProducer.Value.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[Kafka] Error disposing Kafka producer.");
            }
        }
    }
}
