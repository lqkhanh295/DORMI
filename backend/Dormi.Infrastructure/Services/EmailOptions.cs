namespace Dormi.Infrastructure.Services;

public class EmailOptions
{
    public const string SectionName = "Email";

    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string SenderEmail { get; set; } = "no-reply@dormi.space";
    public string SenderName { get; set; } = "DORMI Platform";
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
