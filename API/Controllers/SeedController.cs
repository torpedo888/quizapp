using API.Data;
using API.Entitites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly DataContext _context;

        public SeedController(DataContext context)
        {
            _context = context;
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedDatabase()
        {
            try
            {
                await Seed.SeedQuizDatabase(_context);
                return Ok("Database seeded successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred while seeding the database: {ex.Message}");
            }
        }

        [HttpGet("emptydb")]
        public async Task<IActionResult> EmptyQuizDatabase()
        {
            try
            {
                await Seed.EmptyQuizDatabase(_context); 
                return Ok("Database emptied successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred while empting the database: {ex.Message}");
            }
        }
    }

}