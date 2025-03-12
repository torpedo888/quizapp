import { Component, Input, OnInit } from '@angular/core';
import { QuizService } from '../_services/quiz.service';
import { CategoryService } from '../_services/category.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class QuizFormComponent implements OnInit {
  quizId: number | null = null;
  title: string = '';
  selectedFile: File | null = null;
  previewImage: string | null = null;
  categoryId: number | null = null;
  categories: any[] = [];
  errorMessage: string = '';

  constructor(
    private quizService: QuizService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.quizId = +id;
        this.loadQuiz(this.quizId);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadQuiz(id: number): void {
    this.quizService.getQuizById(id).subscribe({
      next: (quiz) => {
        this.title = quiz.title;
        this.categoryId = quiz.categoryId;
        this.previewImage = `https://localhost:5001${quiz.imageUrl}`;
      },
      error: (err) => console.error('Error loading quiz', err)
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveQuiz(): void {
    if (!this.title || !this.categoryId || (!this.selectedFile && !this.quizId)) {
      this.errorMessage = 'Please enter a title, select a category, and upload an image.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('categoryId', this.categoryId.toString());
    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    if (this.quizId) {
      this.quizService.updateQuiz(this.quizId, formData).subscribe({
        next: () => this.router.navigate(['/quizzes']),
        error: (err) => {
          console.error('Error updating quiz', err);
          this.errorMessage = 'Failed to update quiz.';
        }
      });
    } else {
      this.quizService.createQuiz(formData).subscribe({
        next: () => this.router.navigate(['/quizzes']),
        error: (err) => {
          console.error('Error adding quiz', err);
          this.errorMessage = 'Failed to add quiz.';
        }
      });
    }
  }
}
