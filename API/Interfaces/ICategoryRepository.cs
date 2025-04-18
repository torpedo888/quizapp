using API.DTOs;
using API.Entitites;

namespace API.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(int id);
    Task<IEnumerable<QuizDto>> GetQuizzesByCategoryAsync(int categoryId, string requestScheme, string host);
    Task AddCategoryAsync(Category category);
    Task<bool> DeleteCategoryAsync(int id);
    Task SaveChangesAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<List<Category>> GetActiveCategoriesAsync();
    Task UpdateAsync(Category category);
}
