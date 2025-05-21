using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entitites;

public class Language
{
    public int Id { get; set; } 
    public string ShortName { get; set; } // e.g., "en", "hu"
    public string Description { get; set; } // e.g., "English", "Hungarian"
}
