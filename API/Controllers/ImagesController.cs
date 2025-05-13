using API.Interfaces;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController: ControllerBase
{
    private readonly IBlobService _blobService;

    public ImagesController(IBlobService blobService)
    {
        _blobService = blobService;
    }

    [HttpGet("list")]
    public async Task<IActionResult> ListImages()
    {
       var images = await _blobService.GetImageListAsync();

        return Ok(images);
    }
}
