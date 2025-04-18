using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class QuizDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
    public int CategoryId { get; set; } 
    public string CategoryName { get; set; } 
    public List<QuestionDto> Questions { get; set; }
    public int QuestionCount { get; set; }
}
