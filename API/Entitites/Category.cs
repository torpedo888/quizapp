using System.Text.Json.Serialization;

namespace API.Entitites;

// public class Category
// {
//     public int Id { get; set; }            // Primary key
//     public string Name { get; set; }        // Name of the category
// }

public class Category
{
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    // Navigation Property
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
