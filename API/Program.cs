using System.Text;
using API.Data;
using API.Entitites;
using API.Extensions;
using API.Interfaces;
using API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Console;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddIdentityService(builder.Configuration);

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

var app = builder.Build();

Console.WriteLine($"WebRootPath: {builder.Environment.WebRootPath}");
Console.WriteLine(Directory.GetCurrentDirectory());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseDeveloperExceptionPage();

}

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(x => x.AllowAnyHeader()
                  .AllowAnyMethod()
                  .WithOrigins("http://localhost:4200")
                  .AllowCredentials()); // Add this line if you're sending credentials

app.UseAuthentication();

app.UseAuthorization();

app.UseDefaultFiles();

app.UseStaticFiles();  // Serves files from wwwroot by default

app.MapControllers();

app.MapFallbackToController("Index", "Fallback");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    await context.Database.MigrateAsync();

}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "error occured during migration");
}

app.Run();
