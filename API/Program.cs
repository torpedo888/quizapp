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
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Warning() // choose your default log level
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

// Replace default logging with Serilog
//builder.Host.UseSerilog();

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
                  .WithOrigins(
                    "http://localhost:4200",
                    "https://red-pebble-0acdc741e.2.azurestaticapps.net" // live site
                    )
                  .AllowCredentials()); // Add this line if you're sending credentials

app.UseAuthentication();

app.UseAuthorization();

app.UseDefaultFiles();

app.UseStaticFiles();  // Serves files from wwwroot by default

app.MapControllers();

//app.MapFallbackToController("Index", "Fallback");

app.MapGet("/", () => "API is running");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();

    // Apply pending migrations at startup so a fresh database gets the schema.
    await context.Database.MigrateAsync();

    // Seed identity data only when the user table is empty.
    await Seed.SeedUsers(userManager, roleManager);

    // Seed quiz data only when there are no quizzes yet.
    var seedFolderPath = Path.Combine(app.Environment.ContentRootPath, "SeedData");
    await QuizSeeder.SeedDatabaseIfEmpty(context, seedFolderPath);

}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "error occured during migration");
}
foreach (var address in app.Urls)
{
    Console.WriteLine($"Listening on: {address}");
}
app.Run();
