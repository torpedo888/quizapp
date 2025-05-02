using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Helpers;

public static class ImageHelper
{
    public static bool IsValidImage(IFormFile file)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".jfif" };
        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif" };

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var contentType = file.ContentType.ToLowerInvariant();

        return allowedExtensions.Contains(ext) &&
            allowedContentTypes.Contains(contentType) &&
            file.Length < 5 * 1024 * 1024;
    }


}
