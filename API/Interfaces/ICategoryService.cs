using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entitites;

namespace API.Interfaces;

public interface ICategoryService
{
    Task<List<Category>> GetActiveCategoriesAsync();
    Task<bool> SetCategoryActiveAsync(int id);
    Task<bool> SetCategoryInactiveAsync(int id);
}
