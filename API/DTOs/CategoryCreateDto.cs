using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class CategoryCreateDto
{
    public string Name { get; set; }
    public IFormFile Image { get; set; } // For file uploads
    public string ImageUrl { get; set; } // For image url selected from cloud. these are only urls not files.
    public string Language { get; set; }
}
