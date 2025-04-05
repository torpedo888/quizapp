using System.Text.Json.Serialization;

namespace API.Entitites;

public class Question
{
    public int Id { get; set; }

    [JsonPropertyName("text")]
    public string Text { get; set; }

    public int QuizId { get; set; }
    public int CategoryId { get; set; }

    public string? ImageUrl { get; set; } // property for image storage

    public string? AudioUrl { get; set; }

    public Quiz Quiz { get; set; }         // Navigation to Quiz
    public Category Category { get; set; } // Navigation to Category
    public ICollection<Option> Options { get; set; } = new List<Option>();  // Navigation to related Options
}

