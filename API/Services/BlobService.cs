namespace API.Services;

using API.Helpers;
using API.Interfaces;
using Azure.Storage.Blobs;

public class BlobService : IBlobService
{
    private readonly BlobContainerClient _containerClient;

    public BlobService(IConfiguration config)
    {
        var connectionString = config["AzureBlobStorage:ConnectionString"];
        var containerName = config["AzureBlobStorage:ContainerName"];
        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists();
    }

    public async Task<string?> UploadImageAsync(IFormFile file, string folder)
    {
        var validImageFile = ImageHelper.IsValidImage(file);

        if(!validImageFile)
            return null;

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var blobName = $"{folder}/{fileName}";

        var blobClient = _containerClient.GetBlobClient(blobName);
        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, overwrite: true);
        
        return blobClient.Uri.ToString();
    }

    public async Task<string?> UpdateImageAsync(string? existingImageUrl, IFormFile newFile, string folder)
    {
        if (!ImageHelper.IsValidImage(newFile))
            return null;

        // Delete old image if URL is provided
        if (!string.IsNullOrWhiteSpace(existingImageUrl))
        {
            try
            {
                var oldBlobUri = new Uri(existingImageUrl);
                var oldBlobName = oldBlobUri.LocalPath.TrimStart('/');
                var oldBlobClient = _containerClient.GetBlobClient(oldBlobName);
                await oldBlobClient.DeleteIfExistsAsync();
            }
            catch
            {
                // Optional: log or handle parsing issues
            }
        }

        // Upload new image
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(newFile.FileName)}";
        var blobName = $"{folder}/{fileName}";
        var blobClient = _containerClient.GetBlobClient(blobName);
        await using var stream = newFile.OpenReadStream();
        await blobClient.UploadAsync(stream, overwrite: true);

        return blobClient.Uri.ToString();
    }

}
