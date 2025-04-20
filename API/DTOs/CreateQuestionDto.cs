using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class CreateQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public string OptionsJson { get; set; } = string.Empty;
    public IFormFile? ImageFile { get; set; }
    public IFormFile? AudioFile { get; set; }
}
