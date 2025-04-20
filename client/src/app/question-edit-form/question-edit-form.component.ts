import { Component, OnInit } from '@angular/core';
import { Question } from '../_models/Question';
import { Quiz } from '../_models/Quiz';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService } from '../_services/question.service';
import { QuizService } from '../_services/quiz.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-edit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './question-edit-form.component.html',
  styleUrl: './question-edit-form.component.css'
})
export class QuestionEditFormComponent implements OnInit {

  questions: Question[] = [];
  quizzes: Quiz[] = [];
  selectedFile: File | null = null;

  questionForm: FormGroup;

  showModal = false;
  isEditMode = false;
  editingQuestionId: number | null = null;
  quizId!: number;

  imageFile: File | null = null; // Store the selected image file
  audioFile: File | null = null;

  constructor(private fb: FormBuilder, private questionService: QuestionService, private quizService: QuizService) {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      quizId: [null, Validators.required],
      imageUrl: [''],
      options: this.fb.array([
        this.fb.group({
          text: ['', Validators.required],
          isCorrect: [false]
        })
      ])
    });

  }

  ngOnInit() {
    this.loadQuizzes();
    this.loadQuestions();
  }

  loadQuestions() {
    this.questionService.getQuestions().subscribe(data => this.questions = data);
  }

  get options(): FormArray<FormGroup> {
    return this.questionForm.get('options') as FormArray<FormGroup>;
  }

  addOption(text: string = '', isCorrect: boolean = false) {
    this.options.push(this.fb.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect]
    }));
  }
  
  removeOption(index: number) {
    this.options.removeAt(index);
  }

  loadQuizzes() {
    this.quizService.getQuizzes().subscribe(data => this.quizzes = data);
  }

  getQuizTitle(quizId: number): string {
    const quiz = this.quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : '';
  }

  openAddModal() {
    this.isEditMode = false;
    this.questionForm.reset();
    this.options.clear();
    this.addOption();
    this.showModal = true;
  }

  onImageSelected(event: any) {
    this.imageFile = event.target.files[0];
  }
  
  onAudioSelected(event: any) {
    this.audioFile = event.target.files[0];
  }

  editQuestion(question: any) {
    this.isEditMode = true;
    this.showModal = true;

    this.editingQuestionId = question.id;

    this.quizId = question.quizId;
  
    this.questionForm.patchValue({
      text: question.text,
      quizId: question.quizId,
      imageUrl: question.imageUrl || ''
    });
  
    this.options.clear();
    for (let opt of question.options || []) {
      this.addOption(opt.text, opt.isCorrect);
    }
  }
  
  saveQuestion() {
    const text = this.questionForm.get('text')?.value;

    console.log('Text:', text);
    console.log('Quiz ID:', this.quizId);

    if (this.questionForm.invalid) return;

    const formData = new FormData();

    formData.append('text', this.questionForm.get('text')?.value);

    const optionsArray = this.options.controls.map(control => ({
      text: control.get('text')?.value,
      isCorrect: control.get('isCorrect')?.value
    }));

    formData.append('optionsJson', JSON.stringify(optionsArray));

    if (this.imageFile) {
      formData.append('imageFile', this.imageFile);
    }
  
    if (this.audioFile) {
      formData.append('audioFile', this.audioFile);
    }
    
  
    if (this.isEditMode && this.editingQuestionId !== null) {
      this.questionService.updateQuestion(this.quizId, this.editingQuestionId, formData)
      .subscribe(() => {
        this.questionService.getQuestionById(this.quizId, this.editingQuestionId!)
          .subscribe((updatedQuestion) => {
            const index = this.questions.findIndex(q => q.id === this.editingQuestionId);
            if (index !== -1) {
              this.questions[index] = updatedQuestion;
              this.questions = [...this.questions]; // triggers change detection
            }
            this.closeModal();
          });
      });
    } else {
      //this.questionService.addQuestion(question).subscribe(() => this.closeModal());
    }
  
  }
  
  closeModal() {
    this.showModal = false;
    this.questionForm.reset();
    this.options.clear();
    this.editingQuestionId = null;
  }

  onFileSelected(event: any) {
    const fileInput = event.target as HTMLInputElement;
    
    if (fileInput.files && fileInput.files.length > 0) {

      const file = fileInput.files[0];
      this.imageFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.questionForm.patchValue({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

}
