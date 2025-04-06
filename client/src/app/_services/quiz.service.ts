import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private apiUrl = environment.apiUrl + 'quiz';

  constructor(private http: HttpClient) {}

  // Get all quizzes
  getQuizzes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get quiz by ID
  getQuizById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create a new quiz
  createQuiz(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Update an existing quiz
  updateQuiz(quizId: number, updatedQuiz: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${quizId}`, updatedQuiz);
  }

  setCategoryInactive(quizId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${quizId}/deactivate`, {});
  }

  setCategoryActive(quizId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${quizId}/activate`, {});
  }
}
