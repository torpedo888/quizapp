using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entitites;
using API.Interfaces;

namespace API.Controllers.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<bool> SetCategoryInactiveAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category != null)
        {
            category.IsActive = false; // Mark as inactive
            await _categoryRepository.UpdateAsync(category);
            return true;
        }
        return false;
    }

    public async Task<bool> SetCategoryActiveAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category != null)
        {
            category.IsActive = true;
            await _categoryRepository.UpdateAsync(category);
            return true;
        }
        return false;
    }

    public async Task<List<Category>> GetActiveCategoriesAsync()
    {
        return await _categoryRepository.GetActiveCategoriesAsync();
    }
}