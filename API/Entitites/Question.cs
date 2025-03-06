using System.Text.Json.Serialization;

namespace API.Entitites;

// public class Question
// {
//     public int Id { get; set; }
//     public string Text { get; set; }           // The question text
//     public int CorrectOptionId { get; set; }    // The ID of the correct option
//     public int QuizId { get; set; }             // Foreign key for the Quiz
//     public int CategoryId { get; set; }         // Foreign key for the Category
// }

public class Question
{
    public int Id { get; set; }

    [JsonPropertyName("text")]
    public string Text { get; set; }

    public int CorrectOptionId { get; set; }
    public int QuizId { get; set; }
    public int CategoryId { get; set; }

    public Quiz Quiz { get; set; }         // Navigation to Quiz
    public Category Category { get; set; } // Navigation to Category
    public ICollection<Option> Options { get; set; } = new List<Option>();  // Navigation to related Options
}
