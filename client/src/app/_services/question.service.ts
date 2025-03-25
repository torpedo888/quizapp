import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { Option } from '../_models/Option';
import { Question } from '../_models/Question';
import { map } from 'rxjs/operators';
import { Quiz } from '../_models/Quiz';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {

  private apiUrl = 'https://localhost:5001/api/';

  private apiQuestionUrl = this.apiUrl + 'questions';
  private apiQuizUrl = this.apiUrl + 'quiz';

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<Question[]> {
    console.log('Calling API to fetch questions...');
  
    return this.http.get<Question[]>(this.apiQuestionUrl).pipe(
      map((questions: Question[]) =>
        questions.map(q => ({
          ...q,
          imageUrl: q.imageUrl ?? '',
          options: q.options.map(o => ({
            ...o,
            isCorrect: o.isCorrect
          })),
          categoryName: q.categoryName ?? "Unknown Category",
          quizId: q.quizId
        }))
      )
    );
  }

  submitAnswers(answers: { questionId: number; selectedOptionId: number }[]): Observable<any> {
    return this.http.post(`${this.apiQuestionUrl}/submit`, { answers });
  }

  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiQuizUrl}/${quizId}/questions`);
  }

  getQuestionById(quizId: number, questionId: number): Observable<Question> {
    return this.http.get<{ result: Question }>(`${this.apiQuestionUrl}/${quizId}/questions/${questionId}`)
      .pipe(
        map(response => response.result) // Extract only the 'result' object
      );
  }

  saveQuestion(quizId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiQuestionUrl}/${quizId}/questions`, formData);
  }
  
  updateQuestion(quizId: number, questionId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiQuestionUrl}/${quizId}/questions/${questionId}`, formData);
  }

  deleteQuestions(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiQuizUrl}/delete-multiple`, { ids });
  }  
}


