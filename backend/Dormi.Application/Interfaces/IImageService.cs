using System.IO;
using System.Threading.Tasks;

namespace Dormi.Application.Interfaces
{
    public interface IImageService
    {
        Task<string> UploadImageAsync(Stream fileStream, string fileName);
        Task<bool> DeleteImageAsync(string publicId);
    }
}
