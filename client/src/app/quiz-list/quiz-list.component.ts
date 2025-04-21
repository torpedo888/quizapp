import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../_services/category.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.css'],
  imports: [CommonModule, RouterModule]
})
export class QuizListComponent implements OnInit {
  quizzes: any[] = [];
  categoryId!: number;

  constructor(private categoryService: CategoryService, private router: Router,
    private route: ActivatedRoute  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('categoryId');
      if (id) {
        this.categoryId = +id;
        this.getQuizzes();
      }
    });
  }

  getQuizzes() {
    this.categoryService.getQuizzesByCategory(this.categoryId).subscribe({
      next: (data) => this.quizzes = Array.isArray(data) ? data : [],
      error: (err) => {
          console.error('Error fetching quizzes:', err);
          this.quizzes = [];
      }
    });
  }

  goToQuiz(quiz: any) {
    this.router.navigate(['/quiz', quiz.id], {
      state: { quizTitle: quiz.title }
    });
  }
}
