using System.Text.Json;
using API.Entitites;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using API.Helpers;
using System.Text.Json.Serialization;
using System.Runtime.CompilerServices;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            Console.WriteLine("Seeding users...");

            if (await userManager.Users.AnyAsync())
            {
                Console.WriteLine("Users already exist in the database. Skipping seeding.");
                return;
            }

            var userData = await System.IO.File.ReadAllTextAsync("Data/UserSeedData.json");
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);

            if (users == null) return;

            var roles = new List<AppRole>()
            {
                new() { Name= Constants.Member},
                new() { Name = Constants.Admin},
                new() { Name = Constants.Moderator}
            };

            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }

            foreach (var user in users)
            {
                user.UserName = user.UserName!.ToLower();
                await userManager.CreateAsync(user, "Pa$$w0rd");
                await userManager.AddToRoleAsync(user, "Member");
            }

            var admin = new AppUser
            {
                UserName = "admin",
                KnownAs = Constants.Admin,
                Gender = "Male",
                City = "AdminCity",
                Country = "AdminLand"
            };

            var result = await userManager.CreateAsync(admin, "Pa$$w0rd");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, Constants.Admin);
                await userManager.AddToRoleAsync(admin, Constants.Moderator);
            }

            // Add this line to check if users are being added
            Console.WriteLine($"Seeding {users.Count} users...");

            // Log the result
            Console.WriteLine("Users have been seeded successfully.");
        }

        public static async Task EmptyQuizDatabase(DataContext context)
        {
            // Clear existing data
            await context.Options.ExecuteDeleteAsync();
            await context.Questions.ExecuteDeleteAsync();
            await context.Quizzes.ExecuteDeleteAsync();
            await context.Categories.ExecuteDeleteAsync();

            await context.SaveChangesAsync();

            // Reset autoincrement values
            await context.Database.ExecuteSqlRawAsync("DELETE FROM sqlite_sequence WHERE name='Options';");
            await context.Database.ExecuteSqlRawAsync("DELETE FROM sqlite_sequence WHERE name='Questions';");
            await context.Database.ExecuteSqlRawAsync("DELETE FROM sqlite_sequence WHERE name='Quizzes';");
            await context.Database.ExecuteSqlRawAsync("DELETE FROM sqlite_sequence WHERE name='Categories';");
        }

        public static async Task SeedQuizDatabase(DataContext context)
        {
            // Clear existing data
            await EmptyQuizDatabase(context);

            if (!await context.Quizzes.AnyAsync())
            {
                var json = await File.ReadAllTextAsync("Data/quiz2_seed.json");
                var quizSeedData = JsonSerializer.Deserialize<QuizSeedData>(json);

                if (quizSeedData != null)
                {
                    // Add Category
                    var category = new Category { Name = quizSeedData.Category.Name };
                    await context.Categories.AddAsync(category);
                    await context.SaveChangesAsync();

                    // Add Quiz
                    var quiz = new Quiz
                    {
                        Title = quizSeedData.Quiz.Title,
                        CategoryId = category.Id
                    };
                    await context.Quizzes.AddAsync(quiz);
                    await context.SaveChangesAsync();

                    // Add Questions & Options
                    foreach (var questionData in quizSeedData.Questions)
                    {
                        var question = new Question
                        {
                            Text = questionData.Text,
                            CorrectOptionId = questionData.CorrectOptionId,
                            QuizId = quiz.Id,
                            CategoryId = category.Id
                        };

                        // Add Question
                        await context.Questions.AddAsync(question);
                        await context.SaveChangesAsync(); // Save to get Question Id

                        var options = new List<Option>();
                        foreach (var optionData in questionData.Options)
                        {
                            var option = new Option
                            {
                                Text = optionData.Text,
                                QuestionId = question.Id,
                                IsCorrect = optionData.IsCorrect
                            };
                            options.Add(option);
                        }
                        context.Options.AddRange(options);
                        context.SaveChanges(); // Save to get Option IDs

                        // Update CorrectOptionId for Question
                        var correctOption = options.FirstOrDefault(o => o.IsCorrect == 1); // Find the correct option
                        if (correctOption != null)
                        {
                            question.CorrectOptionId = correctOption.Id;
                            context.SaveChanges(); // Save the correctOptionId for the question
                        }
                    }
                }
            }
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
    }

    public class QuestionData
    {
        [JsonPropertyName("text")]
        public string Text { get; set; }

        [JsonPropertyName("correctOptionId")]
        public int CorrectOptionId { get; set; }

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


}