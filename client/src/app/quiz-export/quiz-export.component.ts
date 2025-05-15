import { Component } from '@angular/core';
import { QuizService } from '../_services/quiz.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-quiz-export',
  standalone: true,
  imports: [FormsModule, JsonPipe, CommonModule],
  templateUrl: './quiz-export.component.html',
  styleUrl: './quiz-export.component.css'
})
export class QuizExportComponent {
  quizId?: number;
  quizData: any = null;

  constructor(private quizService: QuizService) { }

  loadQuiz() {
    if (!this.quizId) return;

    this.quizService.getQuizById(this.quizId).subscribe(data => {
      this.quizData = {
        category: { name: data.categoryName },
        quiz: { title: data.title, imageUrl: data.imageUrl },
        questions: data.questions.map((q: any) => ({
          text: q.text,
          options: q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect ? 1 : 0 }))
        }))
      };
    });
  }

  exportToJson() {
    if (!this.quizData) return;

    const json = JSON.stringify(this.quizData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.quizData.quiz.title.replace(/\s+/g, '_').toLowerCase()}_export.json`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
