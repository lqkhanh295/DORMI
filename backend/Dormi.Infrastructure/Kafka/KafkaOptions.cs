namespace Dormi.Infrastructure.Kafka;

public class KafkaOptions
{
    public const string SectionName = "Kafka";

    public bool Enabled { get; set; } = true;
    public string BootstrapServers { get; set; } = "localhost:9092";
    public string GroupId { get; set; } = "dormi-notification-consumer";
    public string NotificationTopic { get; set; } = "dormi.notifications";
    public string AuditTopic { get; set; } = "dormi.audit";
}
