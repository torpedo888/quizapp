using Microsoft.AspNetCore.Identity;

namespace API.Entitites;

public class AppUser : IdentityUser<int>
{
    public DateOnly DateOfBirth { get; set; }

    public required string KnownAs { get; set; }

    public DateTime Created { get; set; } = DateTime.Now;

    public DateTime LastActive { get; set; } = DateTime.Now;

    public required string Gender { get; set; }

    public string? Introduction { get; set; }

    public string? LookingFor { get; set; }

    public string? Interests { get; set; }

    public required string City { get; set; }

    public string Country { get; set; }

    public ICollection<Photo> Photos { get; set; }

    public ICollection<AppUserRole> UserRoles { get; set; } = [];

}