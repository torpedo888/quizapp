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
    private readonly ILanguageRepository _languageRepository;
    private readonly IWebHostEnvironment _environment;

    public CategoriesController(ICategoryRepository categoryRepository,ILanguageRepository languageRepository,
                                ICategoryService categoryService, IBlobService blobService, 
                                IWebHostEnvironment environment)
    {
        _categoryRepository = categoryRepository;
        _languageRepository = languageRepository;
        _categoryService = categoryService;
        _blobService = blobService;
        _environment = environment;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(
        [FromQuery] bool onlyActive = false, [FromQuery] string languageName = "en")
    {
        var language = await _languageRepository.GetLanguageByNameAsync(languageName);

        if (language == null)
        {
            return BadRequest($"Language '{languageName}' not found.");
        }

        var categories = await _categoryRepository.GetAllCategoriesAsync();

        if (onlyActive)
        {
            categories = categories.Where(c=>c.IsActive).ToList();
        }

        var categoryDtos = categories
        .Where(c => c.Language.Id == language.Id)
        .Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            IsActive = c.IsActive,
            ImageUrl = c.ImageUrl,
            LanguageShortName = c.Language.ShortName
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
    public async Task<IActionResult> AddCategory([FromForm] CategoryCreateDto dto)
    {
        var language = await _languageRepository.GetLanguageByNameAsync(dto.Language);

        if (language == null)
        {
            return BadRequest($"Language '{dto.Language}' not found.");
        }
        
        var category = new Category
        {
            Name = dto.Name,
            IsActive = true,
            ImageUrl = dto.ImageUrl,
            Language = language
        };

        if (dto.Image != null)
        {
            var imageUrl = await _blobService.UploadImageAsync(dto.Image, uploadFolder);

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

        //edited imageurl, chosen from the cloud rather than uploading a new
        if(model.ImageUrl != null)
        {
            category.ImageUrl = model.ImageUrl;
        }

        await _categoryRepository.UpdateAsync(category);

        return NoContent(); // 204 No Content response
    }
}
