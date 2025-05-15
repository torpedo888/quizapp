using Microsoft.AspNetCore.Mvc;
using API.Data;
using Microsoft.EntityFrameworkCore;
using API.Entitites;
using API.DTOs;
using API.Interfaces;

[Route("api/[controller]")]
[ApiController]
public class QuestionsController(DataContext context, IBlobService blobService) : ControllerBase
{
    private const string uploadFolder = "questions";

    private readonly DataContext _context = context;
    private readonly IBlobService _blobService = blobService;

    // GET method for retrieving a question
    [HttpGet("{id}")]
    public IActionResult GetQuestion(int id)
    {
        var question = _context.Questions.Find(id);
        if (question == null)
        {
            return NotFound();
        }
        return Ok(question);
    }

    [HttpGet]
    public async Task<IActionResult> GetQuestions()
    {
        try
        {
            var questions = await _context.Questions
                .Include(q => q.Options)
                .Include( k => k.Quiz)
                .ToListAsync();

            // Convert to DTOs
            var questionDtos = questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                ImageUrl = q.ImageUrl,
                Options = q.Options.Select(o => new OptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect == 1
                }).ToList(),
                QuizId = q.QuizId
            }).ToList();

            return Ok(questionDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    public class SubmitQuizDto
    {
        public List<UserAnswerDto> Answers { get; set; }
    }

    public class UserAnswerDto
    {
        public int QuestionId { get; set; }
        public int SelectedOptionId { get; set; }
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
            ImageUrl = q.ImageUrl, // Include ImageUrl field
            Options = q.Options.Select(o => new OptionDto
            {
                Id = o.Id,
                Text = o.Text,
                IsCorrect = o.IsCorrect == 1
            }).ToList()
        }).ToList();

        return Ok(questionDtos);
    }


    [HttpPost("{quizId}/questions")]
    public async Task<IActionResult> CreateQuestion(int quizId, 
        [FromForm] CreateQuestionDto dto)
    {
        var quiz = await _context.Quizzes.FindAsync(quizId);
        if (quiz == null) return NotFound("Quiz not found");

        string? imageUrl = null;
        string? audioUrl = null;

        var question = new Question
        {
            QuizId = quizId,
            Text = dto.Text
           // ImageUrl = imageUrl, // Store the image URL
          //  AudioUrl = audioUrl // Store the audio URL
        };

        if (dto.ImageFile != null)
        {
            imageUrl = await _blobService.UploadImageAsync(dto.ImageFile, uploadFolder);

            if (imageUrl != null) 
            {
                question.ImageUrl = imageUrl;
            }
            else
            {
                return BadRequest("invalid image file");
            }
        }

        // ✅ Handle Audio Upload
        if (dto.AudioFile != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/audio");
            Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.AudioFile.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.AudioFile.CopyToAsync(fileStream);
            }
            audioUrl = $"/audio/{uniqueFileName}";
        }

        // ✅ Deserialize options
        var options = System.Text.Json.JsonSerializer.Deserialize<List<OptionDto>>(dto.OptionsJson);
        
        context.Questions.Add(question);
        await context.SaveChangesAsync();

        foreach (var optionData in options!)
        {
            var option = new Option
            {
                Text = optionData.Text,
                IsCorrect = optionData.IsCorrect ? 1 : 0,
                QuestionId = question.Id
            };
            context.Options.Add(option);
        }
        await context.SaveChangesAsync();

        return Ok(new { message = "Question added successfully", question.Id });
    }

    [HttpPut("{quizId}/questions/{questionId}")]
    public async Task<IActionResult> UpdateQuestion(int quizId, int questionId,
        [FromForm] QuestionUpdateDto dto)
    {
        var question = await _context.Questions.FindAsync(questionId);
        if (question == null) return NotFound("Question not found");

        if (question.QuizId != quizId) return BadRequest("Question does not belong to this quiz");

        string? imageUrl = question.ImageUrl; // Keep existing image
        string? audioUrl = question.AudioUrl; // Keep existing audio

        // Delete image if requested
        if (Request.Form.ContainsKey("deleteImage") && question.ImageUrl != null)
        {
            await _blobService.DeleteImageAsync(question.ImageUrl);
            question.ImageUrl = null;
        }

        if (dto.ImageFile != null)
        {
            imageUrl = await _blobService.UpdateImageAsync(question.ImageUrl, dto.ImageFile, uploadFolder);

            if (imageUrl != null) 
            {
                question.ImageUrl = imageUrl;
            }
            else
            {
                return BadRequest("invalid image file");
            }
        }

        //edited imageurl, chosen from the cloud rather than uploading a new
        if(dto.ImageUrl != null)
        {
            question.ImageUrl = dto.ImageUrl;
        }

        // ✅ Deserialize options
        var options = System.Text.Json.JsonSerializer.Deserialize<List<OptionDto>>(dto.OptionsJson);
        if (options == null) return BadRequest("Invalid options data");

        // ✅ Update Question Fields
        question.Text = dto.Text;
        //  question.ImageUrl = imageUrl;
        question.AudioUrl = audioUrl;

        _context.Questions.Update(question);
        await _context.SaveChangesAsync();

        // ✅ Remove old options & add new ones
        var existingOptions = _context.Options.Where(o => o.QuestionId == question.Id);
        _context.Options.RemoveRange(existingOptions);
        await _context.SaveChangesAsync();

        foreach (var optionData in options)
        {
            var option = new Option
            {
                Text = optionData.Text,
                IsCorrect = optionData.IsCorrect ? 1 : 0,
                QuestionId = question.Id
            };
            _context.Options.Add(option);
        }
        await _context.SaveChangesAsync();

        // ✅ Fully detach question (safeguard)
        _context.Entry(question).State = EntityState.Detached;

        return Ok(new { message = "Question updated successfully", id = question.Id });
    }

    [HttpGet("{quizId}/questions/{questionId}")]
    public async Task<IActionResult> GetQuestion(int quizId, int questionId)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var questionDto  = await _context.Questions
            .Where(q => q.Id == questionId && q.QuizId == quizId)
            .Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                ImageUrl = q.ImageUrl,
                Options = q.Options.Select(o => new OptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect == 1
                }).ToList(),
                QuizId= q.QuizId
            }).FirstOrDefaultAsync();

        if (questionDto == null)
        return NotFound("Question not found");

        return Ok(questionDto);
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
    public async Task<IActionResult> DeleteMultiple([FromBody] DeleteQuestionsRequestDto request)
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

public class QuestionCreateRequest
{
    public string Text { get; set; }
    public int CorrectOptionId { get; set; }
    public List<OptionCreateRequest> Options { get; set; } = [];
    public int QuizId { get; set; }
}

public class OptionCreateRequest
{
    public string Text { get; set; }
}