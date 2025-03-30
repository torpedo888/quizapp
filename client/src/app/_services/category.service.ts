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

  getCategories(onlyActive: boolean): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?onlyActive=${onlyActive}`);
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  uploadCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getQuizzesByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${categoryId}/quizzes`);
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${categoryId}`);
  }

  setCategoryInactive(categoryId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${categoryId}/deactivate`, {})
  }

  setCategoryActive(categoryId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${categoryId}/activate`, {})
  }

  updateCategory(categoryId: number, newName: string, imageFile?: File): Observable<void> {
    const formData = new FormData();
    formData.append("name", newName);
    if (imageFile) {
      formData.append("image", imageFile);
    }
  
    return this.http.put<void>(`${this.apiUrl}/${categoryId}`, formData);
  }
  
}
