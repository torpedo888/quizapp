using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class CreateQuizDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public int CategoryId { get; set; }
    public IFormFile Image { get; set; }
}
