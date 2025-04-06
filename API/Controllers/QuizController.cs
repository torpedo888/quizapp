using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Entitites;
using API.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using API.Interfaces;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QuizController : ControllerBase
{
    private readonly IQuizRepository _quizRepository;
    private readonly IWebHostEnvironment _environment;

    public QuizController(IQuizRepository quizRepository, IWebHostEnvironment environment)
    {
        _quizRepository = quizRepository;
        _environment = environment;
    }

    // GET: api/quiz
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzes()
    {
        try
        {
           // var quizzes = await _context.Quizzes.ToListAsync();
            var quizzes = await _quizRepository.GetAllQuizesAsync();

            var quizDtos = quizzes.Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                IsActive = q.IsActive,
                CategoryId = q.CategoryId,
                ImageUrl = q.ImageUrl!=null ? $"{Request.Scheme}://{Request.Host}{q.ImageUrl}" : null
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
        // var quiz = await _context.Quizzes
        //     .Include(q => q.Questions)
        //     .ThenInclude(q => q.Options)
        //     .FirstOrDefaultAsync(q => q.Id == id);

        var quiz = await _quizRepository.GetQuizWithQuestionsAndOptionsAsync(id);

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
    //public async Task<IActionResult> CreateQuiz([FromForm] string title, [FromForm] IFormFile imageFile, [FromForm] int categoryId)
    public async Task<IActionResult> CreateQuiz([FromForm] CreateQuizDto quizDto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(quizDto.Title) || quizDto.ImageFile == null)
            {
                return BadRequest("Title and Image are required.");
            }

            // Generate unique file name
            var fileName = $"{Guid.NewGuid()}_{quizDto.ImageFile.FileName}";
            var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await quizDto.ImageFile.CopyToAsync(stream);
            }

            // Create new Quiz
            var quiz = new Quiz
            {
                Title = quizDto.Title,
                Description = quizDto.Description,
                IsActive = quizDto.IsActive,
                ImageUrl = "/uploads/" + fileName,
                CategoryId = quizDto.CategoryId
            };

            // _context.Quizzes.Add(quiz);
            // await _context.SaveChangesAsync();

            await _quizRepository.AddQuizAsync(quiz);

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
    public async Task<IActionResult> UpdateQuiz(int id, [FromForm] UpdateQuizDto quizDto)
    {
        //var quiz = await _context.Quizzes.FindAsync(id);
        var quiz = await _quizRepository.GetByIdAsync(id);
        if (quiz == null) return NotFound();

        quiz.Title = quizDto.Title;
        quiz.IsActive = quizDto.IsActive;
        quiz.CategoryId = quizDto.CategoryId;

        if (quizDto.ImageFile != null)
        {
            // Delete the old image if it exists
            if (!string.IsNullOrEmpty(quiz.ImageUrl))
            {
                var oldImagePath = Path.Combine("wwwroot", "uploads", Path.GetFileName(quiz.ImageUrl));
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }
            }

            // Save the new image
            var fileName = $"{Guid.NewGuid()}_{quizDto.ImageFile.FileName}";
            var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await quizDto.ImageFile.CopyToAsync(stream);
            }
            quiz.ImageUrl = $"/uploads/{fileName}";
        }

        // _context.Quizzes.Update(quiz);

        // await _context.SaveChangesAsync();

        await _quizRepository.UpdateAsync(quiz);

        return NoContent();
    }

    [HttpGet("{quizId}/questions")]
    public async Task<IActionResult> GetQuestionsByQuizId(int quizId)
    {
        // var questions = await _context.Questions
        //     .Where(q => q.QuizId == quizId)
        //     .Include(q => q.Options)
        //     .ToListAsync();

        var questions = await _quizRepository.GetQuestionsWithOptionsByQuizIdAsync(quizId);

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


    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        // var success = await _categoryService.SetCategoryInactiveAsync(id);
        // if (!success) return NotFound();
        
         return NoContent();
    }

    [HttpPut("{id}/activate")]
    public async Task<IActionResult> ActivateCategory(int id)
    {
        // var success = await _categoryService.SetCategoryActiveAsync(id);
        // if (!success) return NotFound();
        
         return NoContent();
    }

}

