import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { Option } from './_models/Option';
import { Question } from './_models/Question';
import { map } from 'rxjs/operators';


// export interface QuestionResponse {
//   question: Question;
//   options: Option[];
// }

@Injectable({
  providedIn: 'root',
})
export class QuestionService {

  private apiUrl = 'https://localhost:5001/api';

 // private apiUrl = 'http://localhost:5233/api/questions/create';

   private apiGetUrl = 'https://localhost:5001/api/questions';

  // constructor(private http: HttpClient) {}

  // saveQuestion(question: Question): Observable<Question> {
  //   return this.http.post<Question>(this.apiUrl, question);
  // }

  //private apiUrl = apiGetUrl; // Change this to match your backend

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<Question[]> {
    console.log('Calling API to fetch questions...');
  
    // return this.http.get<Question[]>(this.apiGetUrl).pipe(
    //   tap((data) => console.log('API call to fetch questions completed', data)),
    //   catchError((error: HttpErrorResponse) => {
    //     console.error('API call failed:', error);
    //     throw error; // Rethrow the error
    //   })
    // );

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
  
}


