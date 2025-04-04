import { Component } from '@angular/core';
import { QuizService } from '../_services/quiz.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../_services/question.service';

@Component({
  selector: 'app-question-delete',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './question-delete.component.html',
  styleUrl: './question-delete.component.css'
})
export class QuestionDeleteComponent {

  questions: any[] = [];
  
  constructor(private quizService: QuizService, private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions() {
    this.questionService.getQuestions().subscribe(data => {
      this.questions = data.map(q => ({ ...q, selected: false }));
    });
  }

  hasSelectedQuestions(): boolean {
    return this.questions.some(q => q.selected);
  }

  deleteSelectedQuestions() {
    const selectedIds = this.questions.filter(q => q.selected).map(q => q.id);

    if (selectedIds.length > 0) {
      this.questionService.deleteQuestions(selectedIds).subscribe(() => {
        this.questions = this.questions.filter(q => !q.selected);
      });
    }
  }
}
