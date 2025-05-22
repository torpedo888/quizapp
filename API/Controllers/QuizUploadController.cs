using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.DTOs;
using API.Entitites;
using API.Helpers;
using API.Data;
using API.Interfaces;

namespace API.Controllers;

[ApiController]
[Route("api/quiz-upload")]
// [Authorize(Policy = Constants.RequiredAdminRole)]
public class QuizUploadController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILanguageRepository _languageRepository;

    public QuizUploadController(DataContext context, ILanguageRepository languageRepository)
    {
        _context = context;
        _languageRepository = languageRepository;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadQuiz([FromBody] QuizUploadData dto)
    {
        var language = await _languageRepository.GetLanguageByNameAsync(dto.Category.LanguageShortName);

        if (language == null)
        {
            return BadRequest($"Language '{dto.Category.LanguageShortName}' not found.");
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == dto.Category.Name)
            ?? new Category { Name = dto.Category.Name, ImageUrl = dto.Category.ImageUrl, Language= language};

        var quiz = new Quiz
        {
            Title = dto.Quiz.Title,
            ImageUrl = dto.Quiz.ImageUrl,
            Category = category,
            Questions = dto.Questions.Select(q => new Question
            {
                Text = q.Text,
                Options = q.Options.Select(o => new Option
                {
                    Text = o.Text,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };

        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Quiz uploaded successfully" });
    }
}

public class QuizUploadData
{
    public CategoryData Category { get; set; }
    public QuizData Quiz { get; set; }
    public List<QuestionData> Questions { get; set; }
}

public class CategoryData
{
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public string LanguageShortName { get; set; }
}
public class QuizData { public string Title { get; set; } public string ImageUrl { get; set; } }
public class QuestionData
{
    public string Text { get; set; }
    public List<OptionData> Options { get; set; }
}
public class OptionData
{
    public string Text { get; set; }
    public int IsCorrect { get; set; }
}

