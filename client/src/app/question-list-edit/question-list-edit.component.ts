import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Option } from '../_models/Option';
import { QuestionService } from '../question.service';
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
  quizId: number = 1; // Set quizId dynamically as needed

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

  updateForm(question: Question) {
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

  onSelectQuestion(event: Event) {
    const selectedIndex = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < this.questions.length) {
      this.selectedQuestion = this.questions[selectedIndex];
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

  submitForm() {
    
    if (this.questionForm.valid && this.selectedQuestion) {
      const formData = new FormData();
      formData.append('text', this.questionForm.get('text')?.value);
      formData.append('categoryId', '1'); // Assuming categoryId is part of Question
      formData.append('optionsJson', JSON.stringify(this.options.value || []));  // Stringify options array

      console.log("optionsJson:", JSON.stringify(this.options.value, null, 2));

  
      const imageUrl = this.questionForm.get('imageUrl')?.value;
      const audioUrl = this.questionForm.get('audioUrl')?.value;
  
      if (imageUrl) {
        formData.append('imageFile', imageUrl);  // Add image if provided
      }
  
      if (audioUrl) {
        formData.append('audioFile', audioUrl);  // Add audio if provided
      }

      // this.questionService.saveQuestion2(this.quizId, formData).subscribe({
      //   next: () => {
      //     this.showToast = true;
      //     setTimeout(() => this.showToast = false, 3000);
      //   },
      //   error: (err) => console.error('Error saving question:', err)
      // });
      this.questionService.updateQuestion(this.quizId, this.selectedQuestion.id, formData).subscribe({
        next: (response) => { 
          this.showToast = true;
          setTimeout(() => this.showToast = false, 3000);
         // this.loadQuestion(response.question); // Refresh UI with updated data
        },
        error: (err) => console.error('Error updating question:', err)
      });
    }
  }
}
