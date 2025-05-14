using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class QuestionUpdateDto
{
    public int QuizId { get; set; }
    public int QuestionId { get; set; }
    public IFormFile? ImageFile { get; set; }
    public IFormFile? AudioFile { get; set; }
    public string Text { get; set; }
    public string OptionsJson { get; set; }
    public string ImageUrl { get; set; }
}
