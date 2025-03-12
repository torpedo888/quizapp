using API.Entitites;
using API.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;


[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IWebHostEnvironment _environment;

    public CategoriesController(ICategoryRepository categoryRepository, IWebHostEnvironment environment)
    {
        _categoryRepository = categoryRepository;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return Ok(await _categoryRepository.GetAllCategoriesAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _categoryRepository.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        if (category == null || string.IsNullOrWhiteSpace(category.Name))
            return BadRequest("Invalid category data");

        await _categoryRepository.AddCategoryAsync(category);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await _categoryRepository.DeleteCategoryAsync(id);
        return NoContent();
    }

    // POST: api/categories/upload
    [HttpPost("upload")]
    public async Task<IActionResult> UploadCategory([FromForm] string name, [FromForm] IFormFile imageFile)
    {
        if (string.IsNullOrWhiteSpace(name) || imageFile == null)
        {
            return BadRequest("Category name and image are required.");
        }

        try
        {
            // Explicitly point to 'wwwroot/uploads' directory
            string uploadDir = Path.Combine(_environment.WebRootPath, "uploads");

            // Create the directory if it doesn't exist
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }


            // Use a custom directory for file uploads
           // string uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

            // Ensure the directory exists, if not, create it
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            // Generate unique file name
            string fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            string filePath = Path.Combine(uploadDir, fileName);
            string imageUrl = $"/uploads/{fileName}"; // Public path

            // Save image
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            // Save category to database
            var category = new Category { Name = name, ImageUrl = imageUrl };
            await _categoryRepository.AddCategoryAsync(category);

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // Update category
    public async Task<IActionResult> UpdateCategory(int id, [FromForm] string name, [FromForm] IFormFile? imageFile)
    {
        var category = await _categoryRepository.GetCategoryByIdAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        category.Name = name;

        if (imageFile != null)
        {
            string uploadDir = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            string fileName = $"{Guid.NewGuid()}_{Path.GetFileName(imageFile.FileName)}";
            string filePath = Path.Combine(uploadDir, fileName);
            string imageUrl = $"/uploads/{fileName}";

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            category.ImageUrl = imageUrl;
        }

        await _categoryRepository.UpdateAsync(category); // Use repository method
        await _categoryRepository.SaveChangesAsync(); // Save changes

        return NoContent();
    }

    [HttpGet("{categoryId}/quizzes")]
    public async Task<IActionResult> GetQuizzesByCategory(int categoryId)
    {
        var quizzes = await _categoryRepository.GetQuizzesByCategoryAsync(categoryId);

        if (!quizzes.Any())
        {
            return NotFound("No quizzes found for this category.");
        }

        return Ok(quizzes);
    }
}
