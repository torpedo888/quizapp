using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entitites;

namespace API.Interfaces;

public interface ILanguageRepository
{
    Task<Language> GetLanguageByNameAsync(string languageName);
}
