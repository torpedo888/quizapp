using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Interfaces;

public interface IQuizService
{
    Task<bool> SetCategoryActiveAsync(int id);
    Task<bool> SetCategoryInactiveAsync(int id);
}
