import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-upload-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-quiz.component.html',
  styleUrl: './upload-quiz.component.css'
})
export class UploadQuizComponent {
  quizJson: any;
  uploadResult = '';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.quizJson = JSON.parse(reader.result as string);
      } catch {
        this.uploadResult = 'Invalid JSON';
      }
    };
    reader.readAsText(file);
  }

  upload() {
    //return this.http.get<Question[]>(`${this.apiQuizUrl}/${quizId}/questions`);
    this.http.post(this.apiUrl + 'quiz-upload/upload', this.quizJson)
      .subscribe({
        next: () => this.uploadResult = 'Upload successful!',
        error: () => this.uploadResult = 'Upload failed.'
      });
  }
}
