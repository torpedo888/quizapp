import { Component } from '@angular/core';
import { QuizService } from '../_services/quiz.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../_services/question.service';
import { Quiz } from '../_models/Quiz';
import { Question } from '../_models/Question';

@Component({
  selector: 'app-question-delete',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './question-delete.component.html',
  styleUrl: './question-delete.component.css'
})
export class QuestionDeleteComponent {

  questions: any[] = [];

  quizzes: Quiz[] = [];
  filteredQuestions: any[] = [];
  selectedQuizId: number | null = null;
  
  constructor(private quizService: QuizService, private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadQuestions();
  }

  loadQuizzes() {
    this.quizService.getQuizzes().subscribe({
      next: data => this.quizzes = data,
      error: err => console.error('Error loading quizzes', err)
    })
  }

  loadQuestions() {
    this.questionService.getQuestions().subscribe(data => {
      this.questions = data.map(q => ({ ...q, selected: false }));
    });
  }

  onSelectQuiz(event: Event) {
    const quizId = +(event.target as HTMLSelectElement).value;
    this.selectedQuizId = quizId;
    this.filteredQuestions = this.questions.filter(q => q.quizId === quizId);

    // if(this.filteredQuestions.length > 0){
    //   this.selectedQuestion = this.filteredQuestions[0];
    //   this.updateForm(this.selectedQuestion);
    // } else {
    //   this.selectedQuestion = null;
    //   this.questionForm.reset(); // Reset form when quiz changes
    // }    
  }

  hasSelectedQuestions(): boolean {
    return this.filteredQuestions.some(q => q.selected);
  }

  deleteSelectedQuestions() {
    const selectedIds = this.filteredQuestions.filter(q => q.selected).map(q => q.id);

    if (selectedIds.length > 0) {
      this.questionService.deleteQuestions(selectedIds).subscribe(() => {
        this.questions = this.questions.filter(q => !q.selected);
      });
    }
  }
}
