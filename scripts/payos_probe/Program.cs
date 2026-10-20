using System;
using System.Text.Json;
using PayOS.Crypto;
using PayOS.Models.Webhooks;

var checksumKey = Environment.GetEnvironmentVariable("PAYOS_CHECKSUM_KEY") 
    ?? "sample_payos_checksum_key_replace_with_env";

long orderCode = args.Length > 0 ? long.Parse(args[0]) : 123;
long amount = args.Length > 1 ? long.Parse(args[1]) : 1000;
string code = args.Length > 2 ? args[2] : "00";
string desc = args.Length > 3 ? args[3] : "success";

var webhookData = new WebhookData
{
    OrderCode = orderCode,
    Amount = amount,
    Description = "DORMI TEST PAY",
    AccountNumber = "123456",
    Reference = "REF_" + orderCode,
    TransactionDateTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
    Currency = "VND",
    PaymentLinkId = "link_" + orderCode,
    Code = code,
    Description2 = desc
};

var crypto = new CryptoProvider();
var sig = crypto.CreateSignatureFromObject(webhookData, checksumKey);

var webhook = new Webhook
{
    Code = code,
    Description = desc,
    Success = code == "00",
    Data = webhookData,
    Signature = sig
};

var json = JsonSerializer.Serialize(webhook, new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = false
});

Console.WriteLine(json);
