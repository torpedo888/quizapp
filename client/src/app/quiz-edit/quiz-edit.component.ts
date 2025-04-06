import { Component, OnInit } from '@angular/core';
import { Quiz } from '../_models/Quiz';
import { QuizService } from '../_services/quiz.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { CategoryService } from '../_services/category.service';
import { Category } from '../_models/Category';

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './quiz-edit.component.html',
  styleUrl: './quiz-edit.component.css'
})
export class QuizEditComponent implements OnInit {

  categories: Category[] = [];
  
  quizes: EditableQuiz[] = [];

  newQuiz: { title: string; description: string; imageUrl: string | null; imageFile: File | null; categoryId: number | null } | null = null;

  saveAttempted = false;

  ngOnInit(): void {
    this.loadCategories(true);
    this.loadQuizzes(false);
  }

  constructor(private categoryService: CategoryService, private quizService: QuizService){

  }

  loadCategories(onlyActive: boolean) {
    this.categoryService.getCategories(onlyActive).subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  loadQuizzes(onlyActive: boolean): void {
      this.quizService.getQuizzes().subscribe((data: Quiz[]) => {
        this.quizes = data.map(quiz => ({
          ...quiz,
          editing: false,
          editedTitle: quiz.title,
          editedDescription: quiz.description,
          editedImage: null,
          imageUrl: quiz.imageUrl || 'assets/default-thumbnail.jpg' // Fallback if no image
        })) as EditableQuiz[];
      });
    }

    addNewQuiz(): void {
      this.newQuiz = { title: '', description: '', imageUrl: null, imageFile: null, categoryId: null };
    }
    
    onNewFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (this.newQuiz) {
            this.newQuiz.imageUrl = e.target.result; // Show preview
            this.newQuiz.imageFile = file;
          }
        };
        reader.readAsDataURL(file);
      }
    }
    
    saveNewQuiz(): void {

      this.saveAttempted = true;

      if (
        !this.newQuiz?.title?.trim() ||
        !this.newQuiz.description?.trim() ||
        !this.newQuiz.categoryId ||
        !this.newQuiz.imageFile
      ) {
        // Validation failed; don't proceed
        return;
      }

      if (!this.newQuiz?.title.trim()) {
        alert('quiz name cannot be empty!');
        return;
      }
    
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('title', this.newQuiz.title);
      formData.append('description', this.newQuiz.description);
      if (this.newQuiz.imageFile) {
        formData.append('imageFile', this.newQuiz.imageFile);
      } else {
        alert('Please select an image.');
      }

      if(this.newQuiz.categoryId == null){
        alert('Please select category.');
        return;
      }

      formData.append('categoryId', this.newQuiz.categoryId.toString());
    
      this.quizService.createQuiz(formData).subscribe((newCat) => {
        this.loadQuizzes(false); // Reload categories after adding
        this.newQuiz = null; // Reset form
        this.saveAttempted = false;
      });
    }
    
    cancelNewQuiz(): void {
      this.newQuiz = null;
    }
  
    editCategory(quiz: EditableQuiz): void {
      quiz.editing = true;
    }
  
    // onFileSelected(event: Event, category: any): void {
    //   const input = event.target as HTMLInputElement;
    //   if (input.files?.length) {
    //     category.editedImage = input.files[0];
    //   }
    // }

    onFileSelected(event: Event, quiz: any) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        quiz.editedImage = file;
    
        // Optional: show preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          quiz.imageUrl = e.target.result; // this lets you preview
        };
        reader.readAsDataURL(file);
      }
    }
    
  
    saveCategory(quiz: any): void {
      if (!quiz.editedTitle.trim()) {
        alert("quiz title cannot be empty!");
        return;
      }

      const formData = new FormData();
      formData.append('title', quiz.editedTitle);
      formData.append('description', quiz.editedDescription);
      formData.append('categoryId', quiz.categoryId.toString());

      if (quiz.editedImage) {
        formData.append('imageFile', quiz.editedImage);
      }
    
    this.quizService.updateQuiz(quiz.id, formData)
      .subscribe(() => {
        quiz.title = quiz.editedTitle; // Update name in UI
        if (quiz.editedImage) {
          quiz.imageUrl = URL.createObjectURL(quiz.editedImage); // Show updated image
        }
        quiz.editing = false; // Exit edit mode
      });
    }
  
    cancelEdit(category: EditableQuiz): void {
      category.editing = false;
      category.editedTitle = category.title;
    }
  
    deactivateCategory(quizId: number): void {
      if (confirm('Are you sure you want to deactivate this category?')) {
        this.quizService.setCategoryInactive(quizId).subscribe(() => {
          const quiz = this.quizes.find(c => c.id === quizId);
          if (quiz) {
            quiz.isActive = false; // UI updates instantly
          }
        });
      }
    }
  
    activateCategory(quizId: number): void {
      this.quizService.setCategoryActive(quizId).subscribe(() => {
        const quiz = this.quizes.find(c => c.id === quizId);
        if (quiz) {
          quiz.isActive = true; // UI updates instantly
        }
      });
    }

}

interface EditableQuiz extends Quiz {
  editing: boolean;
  editedTitle: String;
  editedDescription: String;
  editedImage: File | null;
}
