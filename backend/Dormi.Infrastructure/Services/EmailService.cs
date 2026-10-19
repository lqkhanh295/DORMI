using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Dormi.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Dormi.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailOptions> options, ILogger<EmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    private static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return "unknown";
        var parts = email.Split('@');
        if (parts.Length != 2) return "***";
        var name = parts[0];
        var domain = parts[1];
        var maskedName = name.Length <= 2 ? name[0] + "***" : name[0] + "***" + name[^1];
        return $"{maskedName}@{domain}";
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new ArgumentException("Recipient email must not be empty.", nameof(toEmail));
        }

        var maskedEmail = MaskEmail(toEmail);

        // 1. Ultra-fast Transactional Delivery via Resend HTTPS REST API (<1s, zero greylisting)
        if (!string.IsNullOrWhiteSpace(_options.ResendApiKey))
        {
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.ResendApiKey.Trim());

                var senderEmail = _options.SenderEmail?.Trim() ?? string.Empty;
                var fromAddress = (!string.IsNullOrWhiteSpace(senderEmail) && senderEmail.EndsWith("@dormi.space", StringComparison.OrdinalIgnoreCase))
                    ? $"{_options.SenderName} <{senderEmail}>"
                    : $"{_options.SenderName} <onboarding@resend.dev>";

                var payload = new
                {
                    from = fromAddress,
                    to = new[] { toEmail },
                    subject = subject,
                    html = htmlBody
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync("https://api.resend.com/emails", content, ct);
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("[EmailService:Resend] Email delivered to {MaskedEmail} via Resend REST API in <1s.", maskedEmail);
                    return;
                }

                // If custom domain is not yet verified on Resend (403), retry immediately with onboarding@resend.dev
                if (!fromAddress.Contains("onboarding@resend.dev"))
                {
                    var fallbackPayload = new
                    {
                        from = $"{_options.SenderName} <onboarding@resend.dev>",
                        to = new[] { toEmail },
                        subject = subject,
                        html = htmlBody
                    };
                    var fallbackContent = new StringContent(JsonSerializer.Serialize(fallbackPayload), Encoding.UTF8, "application/json");
                    var fallbackResponse = await httpClient.PostAsync("https://api.resend.com/emails", fallbackContent, ct);
                    if (fallbackResponse.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("[EmailService:Resend] Email delivered to {MaskedEmail} via Resend (onboarding fallback) in <1s.", maskedEmail);
                        return;
                    }
                }

                var errBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[EmailService:Resend] Resend API returned {StatusCode}: {Error}, falling back to SMTP...", response.StatusCode, errBody);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[EmailService:Resend] Resend API call failed, falling back to SMTP...");
            }
        }

        // If SMTP credentials are not configured, log dev simulation and return
        if (string.IsNullOrWhiteSpace(_options.SmtpHost) || string.IsNullOrWhiteSpace(_options.UserName) || string.IsNullOrWhiteSpace(_options.Password))
        {
            _logger.LogWarning("[EMAIL SIMULATION] Chưa cấu hình tài khoản SMTP (Email:UserName và Email:Password) trong appsettings.Local.json. Bỏ qua gửi email tới {MaskedEmail} với tiêu đề '{Subject}'.",
                maskedEmail, subject);
            return;
        }

        try
        {
            var senderAddress = !string.IsNullOrWhiteSpace(_options.SenderEmail) ? _options.SenderEmail : _options.UserName;
            using var message = new MailMessage
            {
                From = new MailAddress(senderAddress, _options.SenderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(toEmail));

            var cleanPassword = _options.Password?.Replace(" ", "").Trim() ?? string.Empty;
            using var client = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
            {
                EnableSsl = _options.EnableSsl,
                Timeout = 8000,
                Credentials = new NetworkCredential(_options.UserName.Trim(), cleanPassword)
            };

            await client.SendMailAsync(message, ct);
            _logger.LogInformation("[EmailService] Email successfully delivered to {MaskedEmail} with subject '{Subject}'.",
                maskedEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailService] Failed to deliver email to {MaskedEmail}: {Error}", maskedEmail, ex.Message);
            throw;
        }
    }

    public Task SendPasswordResetOtpAsync(string toEmail, string otp, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ResendApiKey) && 
            (string.IsNullOrWhiteSpace(_options.SmtpHost) || string.IsNullOrWhiteSpace(_options.UserName) || string.IsNullOrWhiteSpace(_options.Password)))
        {
            _logger.LogWarning("[EMAIL SIMULATION] Chưa cấu hình Resend API Key hoặc tài khoản SMTP. Mã OTP cho {Email} là: [{Otp}]", toEmail, otp);
            return Task.CompletedTask;
        }
        var subject = "[DORMI] Mã xác thực đặt lại mật khẩu của bạn";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 20px; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 32px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .brand {{ font-size: 24px; font-weight: 800; color: #00153D; letter-spacing: -0.5px; }}
    .accent {{ color: #F2A900; }}
    .otp-card {{ background: #F0F4FF; border: 1px solid #D6E4FF; border-radius: 14px; text-align: center; padding: 24px; margin: 24px 0; }}
    .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00153D; font-family: monospace; }}
    .warning {{ font-size: 13px; color: #64748B; line-height: 1.6; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E2E8F0; }}
    .badge {{ display: inline-block; background: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='brand'>DORMI<span class='accent'>.</span></div>
      <p style='color: #64748B; font-size: 14px; margin-top: 4px;'>Hệ sinh thái Thuê trọ & Ghép bạn cùng phòng Thông minh</p>
    </div>
    
    <h2 style='font-size: 18px; font-weight: 700; margin-bottom: 8px;'>Yêu cầu đặt lại mật khẩu</h2>
    <p style='font-size: 14px; color: #475569; line-height: 1.5;'>
      Chúng tôi nhận được yêu cầu cấp lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Sử dụng mã xác thực (OTP) dưới đây để tiếp tục:
    </p>

    <div class='otp-card'>
      <div class='badge'>HIỆU LỰC TRONG 15 PHÚT</div>
      <div class='otp-code'>{otp}</div>
      <p style='font-size: 12px; color: #64748B; margin: 8px 0 0 0;'>Mã chỉ sử dụng được 01 lần duy nhất</p>
    </div>

    <div class='warning'>
      <p><strong>Lưu ý bảo mật quan trọng:</strong></p>
      <ul style='padding-left: 20px; margin: 6px 0;'>
        <li>Tuyệt đối KHÔNG chia sẻ mã OTP này cho bất kỳ ai, kể cả nhân viên hỗ trợ của DORMI.</li>
        <li>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này. Mật khẩu hiện tại của bạn vẫn an toàn.</li>
      </ul>
      <p style='margin-top: 16px; font-size: 11px; color: #94A3B8; text-align: center;'>© 2026 DORMI Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>";

        // ponytail: Dispatch email delivery asynchronously in background so forgot-password returns in <20ms
        _ = Task.Run(async () =>
        {
            try
            {
                using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                await SendEmailAsync(toEmail, subject, htmlBody, timeoutCts.Token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmailService] Gửi email OTP ngầm thất bại tới {MaskedEmail}", MaskEmail(toEmail));
            }
        });

        return Task.CompletedTask;
    }
}
