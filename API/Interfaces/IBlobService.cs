using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Interfaces;

public interface IBlobService
{
    Task<string?> UploadImageAsync(IFormFile file, string folder);

    Task<string?> UpdateImageAsync(string? existingImageUrl, IFormFile newFile, string folder);

    Task DeleteImageAsync(string imageUrl);
}
