using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Dormi.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Dormi.Infrastructure.Services
{
    public class CloudinaryService : IImageService
    {
        private readonly Cloudinary? _cloudinary;
        private readonly bool _hasValidConfig;

        public CloudinaryService(IConfiguration config)
        {
            var cloudName = GetConfigValue(config, "CloudinarySettings:CloudName", "CLOUDINARY_CLOUD_NAME", "CloudinarySettings__CloudName");
            var apiKey = GetConfigValue(config, "CloudinarySettings:ApiKey", "CLOUDINARY_API_KEY", "CloudinarySettings__ApiKey");
            var apiSecret = GetConfigValue(config, "CloudinarySettings:ApiSecret", "CLOUDINARY_API_SECRET", "CloudinarySettings__ApiSecret");

            if (!string.IsNullOrWhiteSpace(cloudName) && !string.IsNullOrWhiteSpace(apiKey) && !string.IsNullOrWhiteSpace(apiSecret))
            {
                var acc = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(acc);
                _hasValidConfig = true;
            }
        }

        private static string? GetConfigValue(IConfiguration config, string key, params string[] envVars)
        {
            var val = config[key];
            if (!string.IsNullOrWhiteSpace(val)) return val.Trim();
            foreach (var env in envVars)
            {
                val = Environment.GetEnvironmentVariable(env) ?? config[env];
                if (!string.IsNullOrWhiteSpace(val)) return val.Trim();
            }
            return null;
        }

        public async Task<string?> UploadImageAsync(Stream fileStream, string fileName)
        {
            if (fileStream == null || fileStream.Length == 0) return null;

            if (_hasValidConfig && _cloudinary != null)
            {
                try
                {
                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(25));
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(fileName, fileStream),
                        Folder = "dormi"
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams, cts.Token);

                    if (uploadResult?.SecureUrl != null)
                    {
                        return uploadResult.SecureUrl.ToString();
                    }
                }
                catch
                {
                    // Cloudinary upload failed or timed out
                }
            }

            // ponytail: Return static clean placeholder URL instead of multi-megabyte base64 string to protect PostgreSQL & RAM
            return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId) || _cloudinary == null) return false;
            try
            {
                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);
                return result.Result == "ok";
            }
            catch
            {
                return true;
            }
        }
    }
}
