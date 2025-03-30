using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Entitites;
using API.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QuizController : ControllerBase
{
    private readonly DataContext _context;
    private readonly IWebHostEnvironment _environment;

    public QuizController(DataContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // GET: api/quiz
    [HttpGet]
    public async Task<IActionResult> GetQuizzes()
    {
        try
        {
            var quizzes = await _context.Quizzes.Where(q => q.Category.IsActive).ToListAsync();

            var quizDtos = quizzes.Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                ImageUrl = q.ImageUrl
            }).ToList();

            return Ok(quizDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    // GET api/quiz/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDto>> GetQuizById(int id)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null) return NotFound();

        var quizDto = new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            ImageUrl = quiz.ImageUrl,
            Questions = quiz.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                Options = q.Options.Select(o => new OptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect == 1
                }).ToList()
            }).ToList()
        };

        return Ok(quizDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuiz([FromForm] string title, [FromForm] IFormFile imageFile, [FromForm] int categoryId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(title) || imageFile == null)
            {
                return BadRequest("Title and Image are required.");
            }

            // Generate unique file name
            var fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            // Create new Quiz
            var quiz = new Quiz
            {
                Title = title,
                ImageUrl = "/uploads/" + fileName,
                CategoryId = categoryId
            };

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();

            return Ok(quiz);
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, $"Database error: {ex.InnerException?.Message ?? ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal error: {ex.Message}");
        }
    }


    // PUT: api/quiz/{id} (Update)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuiz(int id, [FromForm] string title, [FromForm] IFormFile? imageFile)
    {
        var quiz = await _context.Quizzes.FindAsync(id);
        if (quiz == null) return NotFound();

        quiz.Title = title;

        if (imageFile != null)
        {
            // Ensure the uploads directory exists
            string uploadDir = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            // Save the new image
            string fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            string filePath = Path.Combine(uploadDir, fileName);
            string imageUrl = $"/uploads/{fileName}";

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            // Remove old image (optional)
            if (!string.IsNullOrEmpty(quiz.ImageUrl))
            {
                string oldImagePath = Path.Combine(_environment.WebRootPath, quiz.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }
            }

            quiz.ImageUrl = imageUrl;
        }

        _context.Quizzes.Update(quiz);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{quizId}/questions")]
    public async Task<IActionResult> GetQuestionsByQuizId(int quizId)
    {
        var questions = await _context.Questions
            .Where(q => q.QuizId == quizId)
            .Include(q => q.Options)
            .ToListAsync();

        if (!questions.Any()) return NotFound();

        var questionDtos = questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            Options = q.Options.Select(o => new OptionDto
            {
                Id = o.Id,
                Text = o.Text,
                IsCorrect = o.IsCorrect == 1
            }).ToList(),
            ImageUrl = q.ImageUrl,
            AudioUrl = q.AudioUrl
        }).ToList();

        return Ok(questionDtos);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var question = await _context.Questions
            .Include(q => q.Options) // Ensure related options are also loaded
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question == null)
        {
            return NotFound(new { message = "Question not found" });
        }

        _context.Options.RemoveRange(question.Options); // Delete associated options
        _context.Questions.Remove(question); // Delete the question itself
        await _context.SaveChangesAsync(); // Save changes to the database

        return Ok(new { message = "Question deleted successfully" });
    }

    [HttpPost("delete-multiple")]
    public async Task<IActionResult> DeleteMultiple([FromBody] DeleteQuestionsRequest request)
    {
        if (request.Ids == null || request.Ids.Count == 0)
            return BadRequest("No questions selected for deletion.");

        var questionsToDelete = await _context.Questions.Where(q => request.Ids.Contains(q.Id)).ToListAsync();
        if (!questionsToDelete.Any())
            return NotFound("No questions found to delete.");

        _context.Questions.RemoveRange(questionsToDelete);
        await _context.SaveChangesAsync();

        return NoContent();
    }

}

public class DeleteQuestionsRequest
{
    public List<int> Ids { get; set; }
}
