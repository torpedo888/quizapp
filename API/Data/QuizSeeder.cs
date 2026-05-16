using System.Text.Json;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using API.Entitites;

namespace API.Data;

public static class QuizSeeder
{
    public static async Task SeedDatabaseIfEmpty(DataContext context, string seedFolderPath)
    {
        if (await context.Quizzes.AnyAsync())
        {
            return;
        }

        await SeedFromFiles(context, seedFolderPath);
    }

    public static async Task SeedDatabase(DataContext context, string seedFolderPath)
    {

        // Clear existing data
        await EmptyQuizDatabase(context);

        await SeedFromFiles(context, seedFolderPath);
    }

    private static async Task SeedFromFiles(DataContext context, string seedFolderPath)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Get all JSON files from the folder
        var jsonFiles = Directory.GetFiles(seedFolderPath, "*.json");

        var defaultLanguage = await context.Languages
            .OrderBy(l => l.Id)
            .FirstOrDefaultAsync();

        if (defaultLanguage == null)
        {
            throw new InvalidOperationException("No languages found. Run migrations/seeding for Languages first.");
        }

        foreach (var file in jsonFiles)
        {
            string jsonContent = await File.ReadAllTextAsync(file);

            var quizData = JsonSerializer.Deserialize<QuizSeedData>(jsonContent);
            if (quizData == null) continue;

            // Check if the category exists
            var category = await context.Categories.FirstOrDefaultAsync(c => c.Name == quizData.Category.Name);
            if (category == null)
            {
                category = new Category
                {
                    Name = quizData.Category.Name,
                    Language = defaultLanguage
                };
                context.Categories.Add(category);
                await context.SaveChangesAsync();
            }

            //check if the quiz is already inserted. if yes then skip it.
            if (await context.Quizzes.AnyAsync(q => q.Title.Trim() == quizData.Quiz.Title.Trim()))
            {
                continue; // Quiz already exists, move to the next file
            }

            // Insert Quiz
            var quiz = new Quiz
            {
                Title = quizData.Quiz.Title,
                CategoryId = category.Id,
                ImageUrl = quizData.Quiz.ImageUrl
            };
            context.Quizzes.Add(quiz);
            await context.SaveChangesAsync();

            // Insert Questions and Options
            foreach (var questionData in quizData.Questions)
            {
                var question = new Question
                {
                    Text = questionData.Text,
                    QuizId = quiz.Id
                };
                context.Questions.Add(question);
                await context.SaveChangesAsync();

                foreach (var optionData in questionData.Options)
                {
                    var option = new Option
                    {
                        Text = optionData.Text,
                        IsCorrect = optionData.IsCorrect,
                        QuestionId = question.Id
                    };
                    context.Options.Add(option);
                }
                await context.SaveChangesAsync();
            }
        }
    }

    public static async Task EmptyQuizDatabase(DataContext context)
    {
        // Clear existing data
        await context.Options.ExecuteDeleteAsync();
        await context.Questions.ExecuteDeleteAsync();
        await context.Quizzes.ExecuteDeleteAsync();
        await context.Categories.ExecuteDeleteAsync();

        await context.SaveChangesAsync();

        // Reset identity (auto-increment) values for SQL Server
        await context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Options', RESEED, 0);");
        await context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Questions', RESEED, 0);");
        await context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Quizzes', RESEED, 0);");
        await context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Categories', RESEED, 0);");
    }

}

public class QuizSeedData
{
    [JsonPropertyName("category")]
    public CategoryData Category { get; set; }

    [JsonPropertyName("quiz")]
    public QuizData Quiz { get; set; }

    [JsonPropertyName("questions")]
    public List<QuestionData> Questions { get; set; }
}

public class CategoryData
{
    [JsonPropertyName("name")]
    public string Name { get; set; }
}

public class QuizData
{
    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; }
}

public class QuestionData
{
    [JsonPropertyName("text")]
    public string Text { get; set; }

    [JsonPropertyName("options")]
    public List<OptionData> Options { get; set; }
}

public class OptionData
{
    [JsonPropertyName("text")]
    public string Text { get; set; }

    [JsonPropertyName("isCorrect")]
    public int IsCorrect { get; set; }

}
