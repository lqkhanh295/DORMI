using System.Threading;
using System.Threading.Tasks;
using Dormi.Application.DTOs;

namespace Dormi.Application.Interfaces;

public interface IKafkaProducer
{
    Task ProduceAsync<T>(string topic, string key, T message, CancellationToken cancellationToken = default);
    Task PublishNotificationAsync(NotificationEvent notification, CancellationToken cancellationToken = default);
}
