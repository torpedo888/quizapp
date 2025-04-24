using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Helpers;

public static class InputSanitizer
{
    private static readonly char[] InvalidChars = {
        '<', '>', '{', '}', ';', '\'', '"', '(', ')', '[', ']', '`',
        '=', '&', '|', '%', '\\', '/', '$', '#', '~'
    };

     public static bool ContainsInvalidChars(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return true;
        return input.Any(c => InvalidChars.Contains(c));
    }

    public static bool AnyContainsInvalidChars(params string[] inputs)
    {
        return inputs.Any(ContainsInvalidChars);
    }
}
