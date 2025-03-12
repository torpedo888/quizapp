import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../_models/Question';
import { QuestionService } from '../question.service';
import { QuizResultComponent } from '../quiz-result/quiz-result.component';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from '../_models/Quiz';

@Component({
  selector: 'app-question-list',
  standalone: true,
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  imports: [CommonModule, FormsModule, QuizResultComponent]
})
export class QuestionListComponent implements OnInit, OnDestroy {
  quizId: number | null = null;
  quizTitle: string = 'Default Quiz Title';
  categoryName: string = 'Basic Math';
  questions: Question[] = [];
  selectedAnswers: { [questionId: number]: number } = {};
  errorMessage: string = '';
  validateSubmitted: boolean = false;
  validateCurrentQuestion: boolean = false; // Flag for per-question validation
  isProcessingNext: boolean = false;

  // Quiz results
  correctAnswers: number = 0;
  score: number = 0;
  totalQuestions: number = 0;

  // For one-question-at-a-time display and timer
  currentQuestionIndex: number = 0;
  timer: number = 30; // seconds per question
  timerInterval: any;

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Get quizId from route params
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));

    // Optionally retrieve quizTitle from navigation state:
    if (history.state && history.state.quizTitle) {
      this.quizTitle = history.state.quizTitle;
    }
    this.loadQuestions();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadQuestions(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    if (!quizId) return;
    
    this.questionService.getQuestionsByQuizId(quizId).subscribe({
      next: (data: Question[]) => {
        console.log("Loaded questions:", data);
        this.questions = data;
        this.totalQuestions = data.length;
        if (data.length > 0 && data[0].categoryName) {
          this.categoryName = data[0].categoryName;
        }
        this.currentQuestionIndex = 0;
        this.startTimer();
      },
      error: (err) => console.error('Error fetching questions:', err)
    });
  }

  startTimer(): void {
    this.timer = 30;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.timer = 0;
        clearInterval(this.timerInterval);
        this.nextQuestion(); // Auto advance when time's up
      }
    }, 1000);
  }

  selectOption(questionId: number, optionId: number): void {
    if (!this.validateSubmitted && !this.validateCurrentQuestion) {
      this.selectedAnswers[questionId] = optionId;
    }
  }

  nextQuestion(): void {
    // Prevent double-clicks
    if (this.isProcessingNext) {
      return;
    }
    this.isProcessingNext = true;

    // Validate current question: show correct (green) or wrong (red) for 2 seconds.
    this.validateCurrentQuestion = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    setTimeout(() => {
      this.validateCurrentQuestion = false;
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.startTimer();
      } else {
        // Last question: submit answers
        this.submitAnswers();
      }
      this.isProcessingNext = false;
    }, 1000);
  }

  submitAnswers(): void {
    this.validateSubmitted = true;
    // Optionally, you might want to disable further changes.
    if (this.questions.some(q => !this.selectedAnswers[q.id])) {
      this.errorMessage = 'Please answer all questions before submitting.';
      return;
    }
  
    // Calculate results locally (or call backend service to evaluate)
    this.correctAnswers = this.questions.filter(q => {
      const selected = this.selectedAnswers[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      return selected === correctOption?.id;
    }).length;
    this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);

    // Stop any active timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (this.questions.some(q => !this.selectedAnswers[q.id])) {
      this.errorMessage = 'Please answer all questions before submitting.';
      return;
    }
  
    // Calculate results locally
    this.correctAnswers = this.questions.filter(q => {
      const selected = this.selectedAnswers[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      return selected === correctOption?.id;
    }).length;
    this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);

    // Navigate to the quiz result component, passing data
    this.router.navigate(['/quiz-result'], {
      state: {
        quizId: this.quizId,
        totalQuestions: this.totalQuestions,
        correctAnswers: this.correctAnswers,
        score: this.score
      }
    });
  }

  resetQuiz(): void {
    this.selectedAnswers = {};
    this.validateSubmitted = false;
    this.correctAnswers = 0;
    this.score = 0;
    this.errorMessage = '';
    this.currentQuestionIndex = 0;
    this.startTimer();
  }
}
