using API.Entitites;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser, AppRole, int,
    IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>, IdentityRoleClaim<int>,
    IdentityUserToken<int>>(options)
    {
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<AppUser>()
                .HasMany(ur => ur.UserRoles)  // An AppUser has many UserRoles
                .WithOne(u => u.User)         // Each UserRole has one AppUser
                .HasForeignKey(ur => ur.UserId) // UserId in UserRoles is the foreign key
                .IsRequired();

            builder.Entity<AppRole>()
                .HasMany(ur => ur.UserRoles)  // An AppRole has many UserRoles
                .WithOne(u => u.Role)         // Each UserRole has one AppRole
                .HasForeignKey(ur => ur.RoleId) // RoleId in UserRoles is the foreign key
                .IsRequired();

        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);

            optionsBuilder.EnableSensitiveDataLogging(); // Enable sensitive data logging for detailed error info
        }
    }
}