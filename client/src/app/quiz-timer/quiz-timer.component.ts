import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';

@Component({
  selector: 'app-quiz-timer',
  standalone: true,
  templateUrl: './quiz-timer.component.html',
  styleUrls: ['./quiz-timer.component.css']
})
export class QuizTimerComponent implements OnInit, OnChanges {
  @Input() totalTime: number = 3;
  @Input() currentQuestion: number = 1;
  @Input() totalQuestions: number = 20;
  @Input() score: number = 0;
  @Input() pointsPerQuestion: number = 500;

  @Output() timeExpired = new EventEmitter<void>();

  timeLeft: number = 5;
  interval: any;

  ngOnInit() {
    this.resetTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentQuestion'] && !changes['currentQuestion'].firstChange) {
      this.resetTimer();
    }
  }

  resetTimer() {
    clearInterval(this.interval);
    this.timeLeft = this.totalTime;
    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeExpired.emit();
        clearInterval(this.interval);
      }
    }, 1000);
  }

  // this method to stop timer from parent
  stopTimer() {
    clearInterval(this.interval);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
