using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class UpdateQuizDto
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public IFormFile ImageFile { get; set; }  // Optional: If the image needs to be updated
    public bool IsActive { get; set; }    // Optional: If you want to enable/disable the quiz
}

