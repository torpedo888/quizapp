using System.Text.Json.Serialization;

namespace API.Entitites;

public class Category
{
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
