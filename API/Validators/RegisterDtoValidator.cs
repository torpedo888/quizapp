using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Helpers;

namespace API.Validators;

public class RegisterDtoValidator
{
    public static (bool IsValid, string? ErrorMessage) Validate(RegisterDto dto)
    {
        if (InputSanitizer.AnyContainsInvalidChars(
                dto.UserName, dto.KnownAs, dto.Password, 
                dto.City, dto.Country, dto.Gender))
        {
            return (false, "DTO contains invalid characters.");
        }

        if (dto.DateOfBirth < DateOnly.Parse("1900-01-01"))
        {
            return (false, "Invalid date of birth.");
        }

        return (true, null);
    }
}
