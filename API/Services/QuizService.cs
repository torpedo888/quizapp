using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Interfaces;

namespace API.Services;

public class QuizService : IQuizService
{
    private IQuizRepository _quizRepository;

    public QuizService(IQuizRepository quizRepository)
    {
        _quizRepository = quizRepository;
    }

    public async Task<bool> SetCategoryActiveAsync(int id)
    {
        var quiz = await _quizRepository.GetByIdAsync(id); 

        if(quiz !=null) 
        {
            quiz.IsActive = true;
            await _quizRepository.UpdateAsync(quiz);
            return true;
        }

        return false;
    }

    public async Task<bool> SetCategoryInactiveAsync(int id)
    {
        var quiz = await _quizRepository.GetByIdAsync(id); 

        if(quiz !=null) 
        {
            quiz.IsActive = false;
            await _quizRepository.UpdateAsync(quiz);
            return true;
        }

        return false;
    }
}
