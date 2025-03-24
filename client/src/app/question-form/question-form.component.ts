import { Component, inject, OnInit } from '@angular/core';
import { QuizService } from '../_services/quiz.service'; // Adjust the path as necessary
import { QuestionService } from '../_services/question.service'; // Ensure you have QuestionService imported
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../_services/category.service';
import { Option } from '../_models/Option';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-question-form',
  standalone: true,
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.css'],
  imports: [FormsModule, CommonModule] // Make sure FormsModule is here
})
export class QuestionFormComponent implements OnInit {
  private toastr = inject(ToastrService);
  
  selectedCategoryId: number | null = null;
  categoryName: string = ''; 
  questionText: string = ''; // Make sure this property exists
  options: Option[] = [];
  correctOptionIndex: number | null = null;
  quizId: number = 1; // Set this to the relevant Quiz ID
  categoryId: number = 1;
  selectedImageFile: File | null = null; // For file upload
  selectedAudioFile: File | null = null; // For file upload
  quizzes: any[] = []; // This will hold the list of quizzes
  selectedQuizId: number | null = null; // Store selected quiz ID
  questionForm: FormGroup; // Form group to handle form submission

  categories: any[] = [];

  constructor(
    private quizService: QuizService,
    private categoryService: CategoryService,
    private questionService: QuestionService, // Inject the QuestionService
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      questionText: [''],
      selectedQuizId: [null], // Add this to hold the quizId
      categoryId: [null],
      correctOptionId: [null],
      optionsJson: [''],
      selectedImageFile: [null],
      selectedAudioFile: [null],
    });
  }

  ngOnInit(): void {

    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

  }

  onCategoryChange() {
    if (this.selectedCategoryId) {
      this.categoryService.getQuizzesByCategory(this.selectedCategoryId).subscribe(data => {
        this.quizzes = data;
      });
    } else {
      this.quizzes = [];
    }
  }

    // Adds a new empty option to the options array
    addOption() {
      const newOptionId = this.options.length > 0 ? this.options[this.options.length - 1].id + 1 : 1;
      this.options.push({ id: newOptionId, text: '', isCorrect: false });
    }
  
    // Removes an option from the options array
    removeOption(index: number) {
      this.options.splice(index, 1);
    }
  
    onImageSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedImageFile = file;
      }
    }
  
    onAudioSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedAudioFile = file;
      }
    }

    onSubmit() {
      // Ensure question text is not empty
      if (!this.questionText.trim()) {
        this.toastr.error('Question text is required.', 'Error');
        console.error('Question text is required.');
        return;
      }
    
      // Prepare the form data
      const formData = new FormData();
      
      // Append question text
      formData.append('text', this.questionText);
    
      // Append categoryId and correctOptionId (make sure these are valid)
      //formData.append('categoryId', this.categoryId.toString());
      formData.append('categoryId', String(this.categoryId)); 


      // if (this.correctOptionIndex !== null) {
      //   formData.append('correctOptionId', this.correctOptionIndex.toString());
      // } else {
      //   console.error('Correct option is required.');
      //   return;
      // }
    
      // Serialize the options array as JSON and append it
      const optionsJson = JSON.stringify(this.options.map(option => 
        ({ text: option.text, isCorrect: option.isCorrect ? 1 : 0 })));
      formData.append('optionsJson', optionsJson);
    
      // Append image and audio files if selected
      if (this.selectedImageFile) {
        formData.append('imageFile', this.selectedImageFile);
      }
      if (this.selectedAudioFile) {
        formData.append('audioFile', this.selectedAudioFile);
      }
    
      // Submit the form data to the service
      this.questionService.saveQuestion(this.selectedQuizId!, formData).subscribe(
        (response) => {
          console.log('Question saved!', response);
          this.toastr.success('Question added successfully!', 'Success');
          // ✅ Clear the form fields after successful submission
          this.questionText = '';
          this.options = [];
          this.selectedImageFile = null;
          this.selectedAudioFile = null;
        },
        (error) => {
          console.error('Error saving question', error);
        }
      );
    }
    
}
