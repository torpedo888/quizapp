using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entitites;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class QuizRepository : IQuizRepository
{
    private readonly DataContext _context;

    public QuizRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddQuizAsync(Quiz quiz)
    {
        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteMultipleQuestionsAsync(DeleteQuestionsRequestDto request)
    {
        var questionsToDelete = await _context.Questions.Where(q => request.Ids.Contains(q.Id)).ToListAsync();
        if (!questionsToDelete.Any())
            return false;

        _context.Questions.RemoveRange(questionsToDelete);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteQuizAsync(int id)
    {
        var quiz = await _context.Quizzes.FindAsync(id);

        if (quiz == null)
        {
            return false;
        }
        _context.Quizzes.Remove(quiz);
        await _context.SaveChangesAsync();
        
        return true;
    }

    public Task<List<Quiz>> GetActiveQuizesAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<Quiz>> GetAllQuizesAsync()
    {
        return await _context.Quizzes
                    .Include(q => q.Questions)
                    .Include(q => q.Category)
                    .ToListAsync();
    }

    public async Task<Quiz?> GetByIdAsync(int id)
    {
        return await _context.Quizzes.FindAsync(id);
    }

    public async Task<List<Question>> GetQuestionsByQuizId(int id)
    {
        var questions = await _context.Questions
            .Where(q => q.QuizId == id)
            .Include(q => q.Options)
            .ToListAsync();

        return questions;
    }

    public async Task<Quiz?> GetQuizWithQuestionsAndOptionsAsync(int id)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(k => k.Id == id);

        return quiz;
    }

    public async Task<List<Question>> GetQuestionsWithOptionsByQuizIdAsync(int quizId)
    {
        var questions = await _context.Questions
            .Where(q => q.QuizId == quizId)
            .Include(q => q.Options)
            .ToListAsync();

        return questions;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Quiz quiz)
    {
        _context.Quizzes.Update(quiz);
        await _context.SaveChangesAsync();
    }
}
