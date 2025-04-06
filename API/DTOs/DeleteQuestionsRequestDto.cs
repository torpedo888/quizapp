using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs;

public class DeleteQuestionsRequestDto
{
    public List<int> Ids { get; set; }
}
