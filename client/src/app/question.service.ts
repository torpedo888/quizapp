import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { Option } from './_models/Option';
import { Question } from './_models/Question';
import { map } from 'rxjs/operators';
import { Quiz } from './_models/Quiz';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {

  private apiUrl = 'https://localhost:5001/api';

 // private apiUrl = 'http://localhost:5233/api/questions/create';

   private apiGetUrl = 'https://localhost:5001/api/questions';

   private apiQuizUrl = this.apiUrl + '/quiz';

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<Question[]> {
    console.log('Calling API to fetch questions...');
  
    return this.http.get<Question[]>(this.apiGetUrl).pipe(
      map((questions: Question[]) =>
        questions.map(q => ({
          ...q,
          options: q.options.map(o => ({
            ...o,
            isCorrect: o.isCorrect
          })),
          categoryName: q.categoryName ?? "Unknown Category"
        }))
      )
    );
  }

  submitAnswers(answers: { questionId: number; selectedOptionId: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions/submit`, { answers });
  }

  // getQuizzes(): Observable<Quiz[]> {
  //   console.log(this.apiQuizUrl)
  //   return this.http.get<Quiz[]>(this.apiQuizUrl);
  // }

  // getQuizById(id: number): Observable<Quiz> {
  //   return this.http.get<Quiz>(`${this.apiQuizUrl}/${id}`);
  // }

  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiQuizUrl}/${quizId}/questions`);
  }
  
}


