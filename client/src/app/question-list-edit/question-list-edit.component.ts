import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Option } from '../_models/Option';
import { QuestionService } from '../_services/question.service';
import { Question } from '../_models/Question';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-question-list-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question-list-edit.component.html',
  styleUrl: './question-list-edit.component.css'
})
export class QuestionListEditComponent {
  @Output() save = new EventEmitter<any>(); 
  @Output() cancel = new EventEmitter<void>(); 

  questionForm!: FormGroup;
  questions: Question[] = [];
  selectedQuestion: Question | null = null;
  showToast: boolean = false; // Controls Bootstrap toast visibility
  imageFile: File | null = null; // Store the selected image file

  constructor(private fb: FormBuilder, private questionService: QuestionService) {
    this.initForm();
  }

  ngOnInit() {
    this.loadQuestions();
  }

  initForm() {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      imageUrl: [''],
      options: this.fb.array([])
    });
  }

  loadQuestions() {
    this.questionService.getQuestions().subscribe((data: Question[]) => {
      this.questions = data;
      if (this.questions.length > 0) {
        this.selectedQuestion = this.questions[0];
        this.updateForm(this.selectedQuestion);
      }
    });
  }

  updateFormold(question: Question) {
    if (!question) return;

    this.questionForm.reset();
    this.questionForm.patchValue({
      text: question.text,
      imageUrl: question.imageUrl
    });

    const optionsArray = this.questionForm.get('options') as FormArray;
    optionsArray.clear();
    question.options.forEach((option: Option) => {
      optionsArray.push(this.createOptionForm(option));
    });
  }

  updateForm(question: Question) {
    console.log('Received question in updateForm:', question);
  
    if (!question) {
      console.error('Question is null or undefined');
      return;
    }
  
    console.log('Text:', question.text);
    console.log('Options:', question.options);
  
    this.questionForm.reset();
    this.questionForm.patchValue({
      text: question.text,
      imageUrl: question.imageUrl
    });
  
    const optionsArray = this.questionForm.get('options') as FormArray;
    if (!optionsArray) {
      console.error('FormArray "options" is missing!');
      return;
    }
  
    optionsArray.clear();
  
    if (question.options && Array.isArray(question.options)) {
      question.options.forEach((option: Option) => {
        console.log('Adding option:', option);
        optionsArray.push(this.createOptionForm(option));
      });
    } else {
      console.warn('Options array is missing or undefined', question);
    }
  }
  
  

  onSelectQuestion(event: Event) {
    const selectedIndex = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < this.questions.length) {
      this.selectedQuestion = this.questions[selectedIndex];

      console.log('quizid:' + this.questions[selectedIndex].quizId)

      this.updateForm(this.selectedQuestion);
    }
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }
  
  getOptionFormGroup(index: number): FormGroup {
    return this.options.at(index) as FormGroup;
  }
  
  createOptionForm(option: Option) {
    return this.fb.group({
      id: [option.id ?? 0],
      text: [option.text, Validators.required],
      isCorrect: [option.isCorrect]
    });
  }

  addOption() {
    this.options.push(this.createOptionForm({ id: 0, text: '', isCorrect: false }));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.imageFile = file;
  
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onload = () => {
        this.questionForm.patchValue({ imageUrl: reader.result as string }); // Update the form value
      };
      reader.readAsDataURL(file);
    }
  }
  

  submitForm() {
    
    if (this.questionForm.valid && this.selectedQuestion) {
      const formData = new FormData();
      formData.append('text', this.questionForm.get('text')?.value);
      formData.append('categoryId', '1'); // Assuming categoryId is part of Question
      formData.append('optionsJson', JSON.stringify(this.options.value || []));  // Stringify options array

      console.log("optionsJson:", JSON.stringify(this.options.value, null, 2));

      // If a new image is selected, attach it
      if (this.imageFile) {
        formData.append('imageFile', this.imageFile);
      } else if (this.questionForm.get('imageUrl')?.value) {
        formData.append('imageUrl', this.questionForm.get('imageUrl')?.value);
      }

      this.questionService.updateQuestion(this.selectedQuestion.quizId, this.selectedQuestion.id, formData).subscribe({
        next: (response) => { 
          this.showToast = true;
          setTimeout(() => this.showToast = false, 3000);

          // Reload only the edited question
          if(this.selectedQuestion){
            this.reloadQuestion(this.selectedQuestion.quizId, this.selectedQuestion.id);
          }
        },
        error: (err) => console.error('Error updating question:', err)
      });
    }
  }

  reloadQuestion(quizId: number, questionId: number) {
    this.questionService.getQuestionById(quizId, questionId).subscribe({
      next: (updatedQuestion) => {
        // Find the index of the updated question
        const index = this.questions.findIndex(q => q.id === questionId);
        
        if (index !== -1) {
          // Replace the updated question in the list
          this.questions[index] = updatedQuestion;
        }
  
        // Update the form with the new data
        this.selectedQuestion = updatedQuestion;
        this.updateForm(this.selectedQuestion);
      },
      error: (err) => console.error('Error reloading question:', err)
    });
  }
  
}
