using API.DTOs;
using API.Entitites;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

[Authorize(Roles = "Admin, Moderator")]
[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private const string uploadFolder = "categories";

    private readonly ICategoryRepository _categoryRepository;
    private readonly ICategoryService _categoryService;
    private readonly IBlobService _blobService;
    private readonly IWebHostEnvironment _environment;

    public CategoriesController(ICategoryRepository categoryRepository, ICategoryService categoryService, 
                                IBlobService blobService, IWebHostEnvironment environment)
    {
        _categoryRepository = categoryRepository;
        _categoryService = categoryService;
        _blobService = blobService;
        _environment = environment;
    }

    [AllowAnonymous]
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
            ImageUrl = c.ImageUrl
        }).ToList();

        return Ok(categoryDtos);
    }

    [AllowAnonymous]
    [HttpGet("{categoryId}/quizzes")]
    public async Task<IActionResult> GetQuizzesByCategory(int categoryId)
    {
        var quizzes = await _categoryRepository.GetQuizzesByCategoryAsync(
        categoryId, Request.Scheme, Request.Host.ToString());

        // Always return 200, even if empty
        return Ok(quizzes);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _categoryRepository.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
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
            var imageUrl = await _blobService.UploadImageAsync(categoryDto.Image, uploadFolder);

            if (imageUrl != null) 
            {
                category.ImageUrl = imageUrl;
            }
            else
            {
                return BadRequest("invalid image file");
            }
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
    public async Task<IActionResult> UpdateCategory(int id, [FromForm] CategoryUpdateDto model)
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
             var imageUrl = await _blobService.UpdateImageAsync(category.ImageUrl, model.Image, uploadFolder);

            if (imageUrl != null) 
            {
                category.ImageUrl = imageUrl;
            }
            else
            {
                return BadRequest("invalid image file");
            }
        }

        await _categoryRepository.UpdateAsync(category);

        return NoContent(); // 204 No Content response
    }
}
