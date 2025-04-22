import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../_models/Question';
import { QuestionService } from '../_services/question.service';
import { QuizResultComponent } from '../quiz-result/quiz-result.component';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, Router } from '@angular/router';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';
import { SoundService } from '../_services/sound-service';
import { SoundType } from '../Enums/SoundType';


@Component({
  selector: 'app-question-list',
  standalone: true,
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  imports: [CommonModule, FormsModule, QuizResultComponent, QuizTimerComponent]
})
export class QuestionListComponent implements OnInit {
  @ViewChild(QuizTimerComponent) timerComponent!: QuizTimerComponent;
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

  userScore = 0;
  pointsPerQuestion = 500;

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public soundService: SoundService
  ) {}

  get isSoundEnabled(): boolean {
    return this.soundService.isSoundEnabled;
  }

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

    // Stop the timer immediately when an option is selected
    if (this.timerComponent) {
      this.timerComponent.stopTimer();
    }
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

      this.userScore += this.pointsPerQuestion;

      this.soundService.playSound(SoundType.Success);
    }

    this.answerSubmitted = true; // Lock choices and show feedback
  }
  
  resetQuiz(): void {
    this.selectedAnswers = {};
    this.showValidation = false;
    this.correctAnswersCount = 0;
    this.score = 0;
    this.errorMessage = '';
    this.currentQuestionIndex = 0;
  }

  onTimeUp() {

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const userAnswer = this.selectedAnswers[currentQuestion.id];

    // Only auto-select the correct answer if the user didn't answer in time
    if (!userAnswer) {
      const correctOption = currentQuestion.options.find(o => o.isCorrect);
      if (correctOption) {
        this.selectedAnswers[currentQuestion.id] = correctOption.id;
      }

      this.answerSubmitted = true;

      if (this.isSoundEnabled)
      {
        //this.playTimerSound(); // Play sound ONLY if user didn’t answer
        this.soundService.playSound(SoundType.Error);
      }
    }
  }

  // playTimerSound(): void {
  //   try {
  //     const audio = new Audio('../assets/sounds/negative_beeps-6008.mp3');
  //     audio.load();
  //     audio.play().catch(error => {
  //       console.error('Audio playback failed:', error);
  //     });
  //   } catch (error) {
  //     console.error('Error initializing audio:', error);
  //   }
  // }

  // playSuccessSound(): void {
  //   try {
  //     const audio = new Audio('../assets/sounds/success_bell.mp3');
  //     audio.load();
  //     audio.play().catch(error => {
  //       console.error('Success sound playback failed:', error);
  //     });
  //   } catch (error) {
  //     console.error('Error playing success sound:', error);
  //   }
  // }

  toggleSound(): void {
   this.soundService.toggleSound();
  }
}
