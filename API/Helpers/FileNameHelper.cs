namespace API.Helpers;

public static class FileNameHelper
{
    public static string GenerateUniqueFileName(string originalFileName, string folder)
    {
        var safeName = Path.GetFileNameWithoutExtension(originalFileName);
        var extension = Path.GetExtension(originalFileName);

        // Optional: sanitize file name to remove unwanted characters
        safeName = SanitizeFileName(safeName);

        var fileName = $"{Guid.NewGuid()}_{safeName}{extension}";
        return $"{folder}/{fileName}";
    }

    private static string SanitizeFileName(string name)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
        {
            name = name.Replace(c, '_');
        }

        // Trim and limit length if needed
        return name.Length > 50 ? name.Substring(0, 50) : name;
    }
}
