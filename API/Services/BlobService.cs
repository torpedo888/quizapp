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

        var blobName = FileNameHelper.GenerateUniqueFileName(file.FileName, folder);

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

        var blobName = FileNameHelper.GenerateUniqueFileName(newFile.FileName, folder);

        var blobClient = _containerClient.GetBlobClient(blobName);

        await using var stream = newFile.OpenReadStream();
        await blobClient.UploadAsync(stream, overwrite: true);

        return blobClient.Uri.ToString();
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        try
        {
            var blobUri = new Uri(imageUrl);
            var containerUri = _containerClient.Uri;

            // Make sure the imageUrl belongs to this container
            if (!blobUri.AbsoluteUri.StartsWith(containerUri.AbsoluteUri, StringComparison.OrdinalIgnoreCase))
                return;

            // Get the relative path of the blob (blob name)
            var blobName = Uri.UnescapeDataString(blobUri.AbsoluteUri.Substring(containerUri.AbsoluteUri.Length).TrimStart('/'));

            var blobClient = _containerClient.GetBlobClient(blobName);
            await blobClient.DeleteIfExistsAsync();
        }
        catch (Exception ex)
        {
            // Log or throw as needed
            Console.WriteLine($"Failed to delete blob: {ex.Message}");
        }
    }

}
