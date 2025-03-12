using API.DTOs;
using API.Entitites;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class CategoryRepository : ICategoryRepository
{
    private readonly DataContext _context;

    public CategoryRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
    {
        return await _context.Categories.ToListAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(int id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<IEnumerable<QuizDto>> GetQuizzesByCategoryAsync(int categoryId)
    {
        return await _context.Quizzes
            .Where(q => q.CategoryId == categoryId)
            .Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                ImageUrl = q.ImageUrl
            })
            .ToListAsync();
    }

    public async Task AddCategoryAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }

    public Task UpdateAsync(Category category)
    {
        _context.Categories.Update(category); // Updates the category in the context
        return Task.CompletedTask; // No async operation needed for Update, just mark it as completed
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
