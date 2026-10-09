namespace Dormi.Infrastructure.Kafka;

public class KafkaOptions
{
    public const string SectionName = "Kafka";

    // ponytail: Default to false so environments without Kafka cluster don't block on socket timeouts.
    public bool Enabled { get; set; } = false;
    public string BootstrapServers { get; set; } = "localhost:9092";
    public string GroupId { get; set; } = "dormi-notification-consumer";
    public string NotificationTopic { get; set; } = "dormi.notifications";
    public string AuditTopic { get; set; } = "dormi.audit";
}
