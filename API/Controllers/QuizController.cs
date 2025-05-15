using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Entitites;
using API.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[Authorize(Roles = "Admin, Moderator")]
[Route("api/[controller]")]
[ApiController]
public class QuizController : ControllerBase
{
    private const string uploadFolder = "quizzes";

    private readonly IQuizRepository _quizRepository;
    private readonly IQuizService _quizService;
    private readonly IBlobService _blobService;
    private readonly IWebHostEnvironment _environment;

    public QuizController(IQuizRepository quizRepository, IQuizService quizService, IBlobService blobService, IWebHostEnvironment environment)
    {
        _quizRepository = quizRepository;
        _quizService = quizService;
        _blobService = blobService;
        _environment = environment;
    }

    [AllowAnonymous]
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
                CategoryName = q.Category.Name,
                ImageUrl = q.ImageUrl,
                QuestionCount = q.Questions?.Count ?? 0
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
        var quiz = await _quizRepository.GetQuizWithQuestionsAndOptionsAsync(id);

        if (quiz == null) return NotFound();

        var quizDto = new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            ImageUrl = quiz.ImageUrl,
            CategoryName = quiz.Category.Name,
            CategoryImageUrl = quiz.Category.ImageUrl ?? "",
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
    public async Task<IActionResult> CreateQuiz([FromForm] CreateQuizDto quizDto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(quizDto.Title) || quizDto.ImageFile == null)
            {
                return BadRequest("Title and Image are required.");
            }

            // // Generate unique file name
            // var fileName = $"{Guid.NewGuid()}_{quizDto.ImageFile.FileName}";
            // var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

            // // Save file
            // using (var stream = new FileStream(filePath, FileMode.Create))
            // {
            //     await quizDto.ImageFile.CopyToAsync(stream);
            // }

            // Create new Quiz
            var quiz = new Quiz
            {
                Title = quizDto.Title,
                Description = quizDto.Description,
                IsActive = quizDto.IsActive,
                CategoryId = quizDto.CategoryId
            };

            if (quizDto.ImageFile != null)
            {
                var imageUrl = await _blobService.UploadImageAsync(quizDto.ImageFile, uploadFolder);

                if (imageUrl != null) 
                {
                    quiz.ImageUrl = imageUrl;
                }
                else
                {
                    return BadRequest("invalid image file");
                }
            }

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
        var quiz = await _quizRepository.GetByIdAsync(id);
        if (quiz == null) return NotFound();

        quiz.Title = quizDto.Title;
        quiz.IsActive = quizDto.IsActive;
        quiz.CategoryId = quizDto.CategoryId;

        if (quizDto.ImageFile != null)
        {
            var safeTitle = quiz.Title.Trim().Replace(" ", "_");
            var uploadFolderWithQuizName = Path.Combine(uploadFolder, safeTitle);

             var imageUrl = await _blobService.UpdateImageAsync(quiz.ImageUrl, quizDto.ImageFile, uploadFolderWithQuizName);

            if (imageUrl != null) 
            {
                quiz.ImageUrl = imageUrl;
            }
            else
            {
                return BadRequest("invalid image file");
            }
        }

        //edited imageurl, chosen from the cloud rather than uploading a new
        if(quizDto.ImageUrl != null)
        {
            quiz.ImageUrl = quizDto.ImageUrl;
        }

        await _quizRepository.UpdateAsync(quiz);

        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("{quizId}/questions")]
    public async Task<IActionResult> GetQuestionsByQuizId(int quizId)
    {
        var questions = await _quizRepository.GetQuestionsWithOptionsByQuizIdAsync(quizId);

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
            AudioUrl = q.AudioUrl,
            QuizId = q.QuizId
        }).ToList();

        return Ok(questionDtos);
    }


    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        var success = await _quizService.SetCategoryInactiveAsync(id);
        if (!success) return NotFound();
        
         return NoContent();
    }

    [HttpPut("{id}/activate")]
    public async Task<IActionResult> ActivateCategory(int id)
    {
        var success = await _quizService.SetCategoryActiveAsync(id);
        if (!success) return NotFound();
        
         return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var result = await _quizRepository.DeleteQuizAsync(id);

        if (!result){
            return NotFound("Quiz with this id not found");
        }

        return NoContent();
    }

}

