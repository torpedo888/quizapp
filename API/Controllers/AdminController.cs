using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entitites;
using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/admin")]
    public class AdminController(UserManager<AppUser> userManager) : BaseController
    {
        [Authorize(Policy = Constants.RequiredAdminRole)]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await userManager.Users
                .OrderBy(x => x.UserName)
                .Select(x => new 
                {
                    x.Id,
                    Username = x.UserName,
                    Roles = x.UserRoles.Select(r=>r.Role.Name).ToList()
                }).ToListAsync();

            return Ok(users);
        }

        [Authorize(Policy = Constants.RequiredAdminRole)]
        [HttpPost("edit-roles/{userName}")]
        public async Task<ActionResult> EditRoles(string username, string roles)
        {
            if(string.IsNullOrEmpty(roles)) return BadRequest("you must select at least one role");

            var selectedRoles = roles.Split(",").ToArray();

            var user = await userManager.FindByNameAsync(username);

            if (user == null) return BadRequest("User not found");

            var userRoles = await userManager.GetRolesAsync(user);

            var result = await userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if(!result.Succeeded) return BadRequest("Failed to add to roles");

            result = await userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded) return BadRequest("Failed to remove roles");

            return Ok(await userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = Constants.ModeratePhotoRole)]
        [HttpGet("photos-to-moderate")]
        public async Task<ActionResult> GetPhotosForModeration()
        {
            return Ok("Admins or Moderators can see this");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-user/{username}")]
        public async Task<ActionResult> DeleteUser(string username)
        {
            var user = await userManager.FindByNameAsync(username);
            if (user == null) return NotFound("User not found");

            var roles = await userManager.GetRolesAsync(user);
            if (roles.Any(role => role.Equals("Admin", StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest("Cannot delete an Admin user");
            }

            var result = await userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest("Failed to delete user");

            return Ok("User deleted successfully");
        }

        [HttpPut("users/{username}")]
        public async Task<ActionResult> UpdateUser(string username, UpdateUserDto dto)
        {
            var user = await userManager.FindByNameAsync(username);
            if (user == null) return NotFound("User not found");

            //user.UserName = dto.UserName;
            // user.City = dto.City;
            // user.Country = dto.Country;
            // other fields...

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest("Update failed");

            var validCurrentPassword = await userManager.CheckPasswordAsync(user, dto.CurrentPassword);

            if(!validCurrentPassword)
            {
                return BadRequest("Current password wrong");
            }

            if (!string.IsNullOrEmpty(dto.NewPassword))
            {
                var removePassResult = await userManager.RemovePasswordAsync(user);
                if (!removePassResult.Succeeded)
                    return BadRequest("Failed to remove old password");

                var addPassResult = await userManager.AddPasswordAsync(user, dto.NewPassword);
                if (!addPassResult.Succeeded)
                    return BadRequest("Failed to set new password");
            }

            return Ok("User updated successfully");
        }
    }
}