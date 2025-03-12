using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class QuizDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string ImageUrl { get; set; }
    public List<QuestionDto> Questions { get; set; }
}
