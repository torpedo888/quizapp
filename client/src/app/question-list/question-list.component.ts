import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../_models/Question';
import { QuestionService } from '../question.service';
import { FormsModule } from '@angular/forms'; 


@Component({
  standalone: true,
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  imports: [CommonModule, FormsModule],
})
export class QuestionListComponent implements OnInit {

  categoryName = 'Basic Math'; // Set this dynamically based on your data

  questions: Question[] = [];
  selectedAnswers: { [questionId: number]: number } = {}; 
  errorMessage: string = '';
  validateSubmitted = false;

  // These are the properties to store quiz results
  correctAnswers: number = 0;
  score: number = 0;
  totalQuestions: number = 0;

  constructor(private questionService: QuestionService) {}

  ngOnInit() {
    this.questionService.getQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        // Extract category from first question (if available)
        // Extract category from the first question
        if (data.length > 0 && data[0].categoryName) {
          this.categoryName = data[0].categoryName;
        } else {
          this.categoryName = "Quiz"; // Fallback if category is missing
        }
      },
      error: (err) => console.error('Error fetching questions', err),
    });
  }

  selectOption(questionId: number, optionId: number) {
    if (!this.validateSubmitted) {
      this.selectedAnswers[questionId] = optionId;
    }
  }

  resetQuiz() {
    this.selectedAnswers = {};  // Clear selected answers
    this.validateSubmitted = false;  // Reset validation state
    this.correctAnswers = 0;  // Reset score
    this.totalQuestions = this.questions.length; // Ensure the question count remains
    this.score = 0; // Reset score percentage
  }

  submitAnswers() {
    this.validateSubmitted = true; // Marks the validation as completed

    if (this.questions.some(q => !this.selectedAnswers[q.id])) {
      this.errorMessage = 'Please answer all questions before submitting.';
      return;
    }
  
    const answers = Object.entries(this.selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId: Number(questionId),
      selectedOptionId
    }));
  
      this.questionService.submitAnswers(answers).subscribe((response) => {
        this.correctAnswers = response.correctAnswers;
        this.score = response.score;
        this.totalQuestions = response.totalQuestions;
      });
    
  }
  
}
