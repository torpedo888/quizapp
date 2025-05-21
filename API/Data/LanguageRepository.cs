using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entitites;
using API.Interfaces;
using Azure.Storage.Blobs.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class LanguageRepository : ILanguageRepository
{
    private readonly DataContext _context;

    public LanguageRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<Language> GetLanguageByNameAsync(string languageName)
    {
       return await _context.Languages.FirstOrDefaultAsync(l => l.ShortName == languageName);
    }
}
