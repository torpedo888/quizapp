import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../_models/Question';
import { QuestionService } from '../_services/question.service';
import { QuizResultComponent } from '../quiz-result/quiz-result.component';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-question-list',
  standalone: true,
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  imports: [CommonModule, FormsModule, QuizResultComponent]
})
export class QuestionListComponent implements OnInit {
  quizId: number | null = null;
  quizTitle: string = 'Default Quiz Title';
  categoryName: string = 'Basic Math';
  questions: Question[] = [];
  selectedAnswers: { [questionId: number]: number } = {};
  errorMessage: string = '';
  showValidation: boolean = false;  // Ensure this exists for validation handling
  isProcessingNext: boolean = false;
  incorrectAnswers: { [questionId: number]: number } = {};
  validateCurrentQuestion: boolean = false; // Flag for per-question validation
  answerSubmitted: boolean = false; // Controls when checkmarks are visible
  correctAnswersCount: number = 0; // Track correct answers count

  // Quiz results
  correctAnswers: number = 0;
  score: number = 0;
  totalQuestions: number = 0;

  // One-question-at-a-time display and timer
  currentQuestionIndex: number = 0;

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));

    if (history.state && history.state.quizTitle) {
      this.quizTitle = history.state.quizTitle;
    }

    this.loadQuestions();
  }

  loadQuestions(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    if (!quizId) return;

    this.questionService.getQuestionsByQuizId(quizId).subscribe({
      next: (data: Question[]) => {
        this.questions = data;
        this.totalQuestions = data.length;

        if (data.length > 0 && data[0].categoryName) {
          this.categoryName = data[0].categoryName;
        }

        this.currentQuestionIndex = 0;
      },
      error: (err) => console.error('Error fetching questions:', err)
    });
  }

  selectOption(questionId: number, optionId: number): void {
    this.selectedAnswers[questionId] = optionId;
    this.showValidation = false; // Hide validation when an option is selected
  }

  nextQuestion(): void {
    this.validateCurrentQuestion = false; // Reset for the next question
    this.errorMessage = '';

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.answerSubmitted = false; // Reset for next question
    } else {

      this.score = Math.round((this.correctAnswersCount / this.totalQuestions) * 100);

      // Navigate to results when all questions are done
      this.router.navigate(['/quiz-result'], {
        state: {
          quizId: this.quizId,
          totalQuestions: this.totalQuestions,
          correctAnswers: this.correctAnswersCount,
          score: this.score
        }
      });
    }
  }

  submitCurrentAnswer(): void {
    const currentQuestion = this.questions[this.currentQuestionIndex];
  
    if (!currentQuestion) return;
  
    // Ensure the user has selected an answer before allowing submit
    if (this.selectedAnswers[currentQuestion.id] === undefined) {
      this.showValidation = true;
      return;
    }

    // Check if the selected answer is correct
    const selectedOptionId = this.selectedAnswers[currentQuestion.id];
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);

    if (selectedOption?.isCorrect) {
      this.correctAnswersCount++; // Increment the score if correct
    }

    this.answerSubmitted = true; // Lock choices and show feedback

    // this.answerSubmitted = true; // Show checkmark/X and disable options
  
    // this.showValidation = false;
    // this.validateCurrentQuestion = true;  // This triggers the "Next" button to appear
  }
  
  

  resetQuiz(): void {
    this.selectedAnswers = {};
    this.showValidation = false;
    this.correctAnswersCount = 0;
    this.score = 0;
    this.errorMessage = '';
    this.currentQuestionIndex = 0;
  }
}
