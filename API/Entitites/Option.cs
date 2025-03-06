using System.Text.Json.Serialization;

namespace API.Entitites;

// public class Option
// {
//     public int Id { get; set; }
//     public string Text { get; set; }            // Option text
//     public int QuestionId { get; set; }         // Foreign key to the Question
// }

public class Option
{
    public int Id { get; set; }

    [JsonPropertyName("text")]
    public string Text { get; set; }
    
    // Flag to mark if the option is correct
    [JsonPropertyName("isCorrect")]
    public int IsCorrect { get; set; }

    public int QuestionId { get; set; }

    // Navigation Property
    public Question Question { get; set; }
}