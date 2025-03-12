import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../_models/Category';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  private apiUrl = environment.apiUrl + "categories";

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  uploadCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  updateCategory(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  getQuizzesByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${categoryId}/quizzes`);
  }
}
