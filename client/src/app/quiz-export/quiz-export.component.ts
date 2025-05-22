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
        category: { name: data.categoryName, imageUrl: data.categoryImageUrl, languageShortName: data.categoryLanguageShortName},
        quiz: { title: data.title, imageUrl: data.imageUrl },
        questions: data.questions.map((q: any) => ({
          text: q.text,
          options: q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect ? 1 : 0 }))
        }))
      };
    });

    // this.quizService.getQuizById(this.quizId).subscribe(data => {
    //   console.log('Raw data from backend:', data);

    //   const categoryImageUrl = data.CategoryImageUrl ?? data.categoryImageUrl ?? 'MISSING_IMAGE';

    //   console.log('Resolved Category Image URL:', categoryImageUrl);

    //   this.quizData = {
    //     category: { name: data.categoryName ?? 'MISSING_NAME', imageUrl: categoryImageUrl },
    //     quiz: { title: data.title ?? 'MISSING_TITLE', imageUrl: data.imageUrl ?? 'MISSING_IMAGE' },
    //     questions: (data.questions ?? []).map((q: any) => ({
    //       text: q.text,
    //       options: (q.options ?? []).map((o: any) => ({ text: o.text, isCorrect: o.isCorrect ? 1 : 0 }))
    //     }))
    //   };

    //   console.log('Constructed quizData:', JSON.stringify(this.quizData, null, 2));
    // });


   // console.log(this.quizData);
    console.log("logging the quiz data:")
    console.log("log:" + JSON.stringify(this.quizData, null, 2));
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
