using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entitites;

namespace API.Interfaces;

public interface IQuizRepository
{
    Task<IEnumerable<Quiz>> GetAllQuizesAsync();
    Task AddQuizAsync(Quiz Quiz);
    Task<bool> DeleteQuizAsync(int id);
    Task<bool> DeleteMultipleQuestionsAsync(DeleteQuestionsRequestDto dto);
    Task SaveChangesAsync();
    Task<Quiz?> GetByIdAsync(int id);
    Task<List<Question>> GetQuestionsByQuizId(int id);
    Task<List<Quiz>> GetActiveQuizesAsync();
    Task<Quiz?> GetQuizWithQuestionsAndOptionsAsync(int id);

    Task<List<Question>> GetQuestionsWithOptionsByQuizIdAsync(int quizId);


    Task UpdateAsync(Quiz Quiz);
}
