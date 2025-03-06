using Microsoft.AspNetCore.Mvc;
using API.Data;
using Microsoft.EntityFrameworkCore;
using API.Entitites;
using API.DTOs;

[Route("api/[controller]")]
[ApiController]
public class QuestionsController(DataContext context) : ControllerBase
{
    private readonly DataContext _context = context;

    [HttpPost("create-quiz")]
    public async Task<IActionResult> PostQuiz([FromBody] Quiz quiz)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _context.Quizzes.AddAsync(quiz);
        await _context.SaveChangesAsync(); // This will set quiz.Id automatically

        return Ok(quiz);
    }

    [HttpPost("create-category")]
    public async Task<IActionResult> PostCategory([FromBody] Category category)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync(); // This will set category.Id automatically

        return Ok(category);
    }


    // POST: api/questions/create
    [HttpPost("create")]
    public async Task<IActionResult> PostQuestion([FromBody] QuestionCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Create a new Question entity
        var question = new Question
        {
            Text = request.Text,
            CorrectOptionId = request.CorrectOptionId,
            QuizId = request.QuizId,
            CategoryId = request.CategoryId
        };

        // Add the question to the context
        await _context.Questions.AddAsync(question);
        await _context.SaveChangesAsync();

        // Get the ID of the newly created question
        var questionId = question.Id;

        // Create the options and set the QuestionId
        foreach (var option in request.Options)
        {
            var newOption = new Option
            {
                Text = option.Text,
                QuestionId = questionId
            };

            await _context.Options.AddAsync(newOption);
        }

        // Save all changes to the database
        await _context.SaveChangesAsync();

        return Ok(question);
    }

    // GET method for retrieving a question
    [HttpGet("{id}")] // Example of a GET method
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
                .Include( c=> c.Category)
                .ToListAsync();

            // Convert to DTOs
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
                CategoryName = q.Category!=null ? q.Category.Name : "Unknown"
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

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizDto submission)
    {
        if (submission == null || submission.Answers == null || submission.Answers.Count == 0)
        {
            return BadRequest("Invalid submission.");
        }

        int correctCount = 0;
        int totalQuestions = submission.Answers.Count;

        foreach (var answer in submission.Answers)
        {
            var question = await _context.Questions.FindAsync(answer.QuestionId);
            if (question != null && question.CorrectOptionId == answer.SelectedOptionId)
            {
                correctCount++;
            }
        }

        var result = new
        {
            TotalQuestions = totalQuestions,
            CorrectAnswers = correctCount,
            Score = (double)correctCount / totalQuestions * 100
        };

        return Ok(result);
    }

}

public class QuestionCreateRequest
{
    public string Text { get; set; }
    public int CorrectOptionId { get; set; }
    public List<OptionCreateRequest> Options { get; set; } = [];
    public int QuizId { get; set; }
    public int CategoryId { get; set; }
}

public class OptionCreateRequest
{
    public string Text { get; set; }
}
