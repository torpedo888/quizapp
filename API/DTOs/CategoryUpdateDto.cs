using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class CategoryUpdateDto
{
    public string Name { get; set; }

    public IFormFile? Image { get; set; }
}
