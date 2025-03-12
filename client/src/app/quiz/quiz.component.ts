import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../_models/Quiz';
import { RouterModule } from '@angular/router';
import { QuizService } from '../_services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  quizzes: Quiz[] = [];

  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getQuizzes().subscribe({
      next: (data) => {
        console.log("Loaded quizzes: ", data);
        this.quizzes = data; // Save the quizzes in a local variable
      },
      error: (err) => console.error('Error fetching quizzes:', err)
    });
  }
}
