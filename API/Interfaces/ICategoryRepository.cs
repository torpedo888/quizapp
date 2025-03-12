using API.DTOs;
using API.Entitites;

namespace API.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(int id);
    Task<IEnumerable<QuizDto>> GetQuizzesByCategoryAsync(int categoryId);
    Task AddCategoryAsync(Category category);
    Task DeleteCategoryAsync(int id);
    Task UpdateAsync(Category category);
    Task SaveChangesAsync();
}
