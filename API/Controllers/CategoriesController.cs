using API.DTOs;
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
    private readonly ICategoryService _categoryService;
    private readonly IWebHostEnvironment _environment;

    public CategoriesController(ICategoryRepository categoryRepository, ICategoryService categoryService,
     IWebHostEnvironment environment)
    {
        _categoryRepository = categoryRepository;
        _categoryService = categoryService;
        _environment = environment;
    }

    // [HttpGet]
    // public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    // {
    //     return Ok(await _categoryRepository.GetAllCategoriesAsync());
    // }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories([FromQuery] bool onlyActive = false )
    {
        var categories = await _categoryRepository.GetAllCategoriesAsync();

        if (onlyActive)
        {
            categories = categories.Where(c=>c.IsActive).ToList();
        }

        var categoryDtos = categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            IsActive = c.IsActive,
            ImageUrl = c.ImageUrl != null ? $"{Request.Scheme}://{Request.Host}{c.ImageUrl}" : null,
        }).ToList();

        return Ok(categoryDtos);
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

    [HttpPost("add")]
    public async Task<IActionResult> AddCategory([FromForm] CategoryCreateDto categoryDto)
    {
        var category = new Category
        {
            Name = categoryDto.Name,
            IsActive = true // Default active
        };

        if (categoryDto.Image != null)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(categoryDto.Image.FileName)}";
            var filePath = Path.Combine("wwwroot/uploads", fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await categoryDto.Image.CopyToAsync(stream);
            }

            category.ImageUrl = $"/uploads/{fileName}";
        }

        await _categoryRepository.AddCategoryAsync(category);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var result = await _categoryRepository.DeleteCategoryAsync(id);

        if(!result)
        {
            return NotFound($"Category with {id} not found");
        }

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
        var quizzes = await _categoryRepository.GetQuizzesByCategoryAsync(
        categoryId, Request.Scheme, Request.Host.ToString());

        // Always return 200, even if empty
        return Ok(quizzes);
    }

    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        var success = await _categoryService.SetCategoryInactiveAsync(id);
        if (!success) return NotFound();
        
        return NoContent();
    }

    [HttpPut("{id}/activate")]
    public async Task<IActionResult> ActivateCategory(int id)
    {
        var success = await _categoryService.SetCategoryActiveAsync(id);
        if (!success) return NotFound();
        
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategoryName(int id, [FromForm] CategoryUpdateDto model)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        category.Name = model.Name;

        //ez menyen file servicebe mert a questioncontrollerben is van file feltoltes.
        if (model.Image != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(model.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await model.Image.CopyToAsync(fileStream);
            }
            category.ImageUrl = $"/images/{uniqueFileName}";
        }

        await _categoryRepository.UpdateAsync(category);

        return NoContent(); // 204 No Content response
    }
}
