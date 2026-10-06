using System.Threading;
using System.Threading.Tasks;

namespace Dormi.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
    Task SendPasswordResetOtpAsync(string toEmail, string otp, CancellationToken ct = default);
}
