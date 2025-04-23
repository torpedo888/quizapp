import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { SoundService } from '../_services/sound-service';
import { SoundType } from '../Enums/SoundType';

@Component({
  standalone: true,
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.css']
})
export class QuizResultComponent {
  totalQuestions: number = 0;
  correctAnswers: number = 0;
  score: number = 0;

  quizMaxScoreUrl: String = environment.quizMaxScoreUrl;
  quizMiddleScoreUrl: String = environment.quizMiddleScoreUrl;
  quizLowScoreUrl: String = environment.quizLowScoreUrl;

  scoreMessageUrl: String = "";

  constructor(private router: Router, private soundService: SoundService) {
    const state = this.router.getCurrentNavigation()?.extras.state as { 
      totalQuestions?: number; 
      correctAnswers?: number; 
      score?: number; 
    } | undefined;

    if (state) {
      this.totalQuestions = state.totalQuestions ?? 0;
      this.correctAnswers = state.correctAnswers ?? 0;
      this.score = state.score ?? 0;

      switch (true) {
        case (this.score >= 90):
          this.scoreMessageUrl = this.quizMaxScoreUrl;
          this.soundService.playSound(SoundType.Applause);
          break;
        case (this.score >= 60 && this.score < 90):
          this.scoreMessageUrl = this.quizMiddleScoreUrl;
          this.soundService.playSound(SoundType.Applause);
          break;
        case (this.score < 60):
          this.scoreMessageUrl = this.quizLowScoreUrl;
          this.soundService.playSound(SoundType.Applause);
          break;
        default:
          this.scoreMessageUrl = '';
      }
      
    }
  }


  retryQuiz() {
    const quizId = history.state.quizId ?? 1; // Default to 1 if missing
    this.router.navigate([`/quiz/${quizId}`]);
  }

  goToCategories() {
    this.router.navigate([`/categories`]);
  }
}
