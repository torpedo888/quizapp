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

  constructor(private fb: FormBuilder, private questionService: QuestionService, private quizService: QuizService) {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      quizId: [null, Validators.required],
      imageUrl: [''],
      options: this.fb.array([this.fb.control('')])
    });

  }

  ngOnInit() {
    this.loadQuizzes();
    this.loadQuestions();
  }

  loadQuestions() {
    this.questionService.getQuestions().subscribe(data => this.questions = data);
  }

  // get options(): FormArray {
  //   return this.questionForm.get('options') as FormArray;
  // }

  get options(): FormArray<FormGroup> {
    return this.questionForm.get('options') as FormArray<FormGroup>;
  }
  

  // addOption(text: string = '') {
  //   this.options.push(this.fb.control(text, Validators.required));
  // }

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

  

  editQuestion(question: any) {
    this.isEditMode = true;
    this.showModal = true;
  
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
  
  saveQuestionOld() {
    if (this.questionForm.invalid) return;

    const formData = { ...this.questionForm.value };

    // if (this.isEditMode && this.editingQuestionId != null) {
    //   this.questionService.updateQuestion(this.editingQuestionId, formData).subscribe(() => {
    //     this.loadQuestions();
    //     this.closeModal();
    //   });
    // } else {
    //   this.questionService.createQuestion(formData).subscribe(() => {
    //     this.loadQuestions();
    //     this.closeModal();
    //   });
    // }
  }

  saveQuestion() {
    if (this.questionForm.invalid) return;
  
    const question = this.questionForm.value;
    question.options = this.options.value.map((text: string) => ({ text }));
  
    if (this.isEditMode) {
      // Call update API
    } else {
      // Call add API
    }
  
    this.closeModal();
  }
  

  toggleStatus(question: Question) {
    // const updated = { ...question, isActive: !question.isActive };
    // this.questionService.updateQuestion(question.id, updated).subscribe(() => {
    //   this.loadQuestions();
    // });
  }

  closeModal() {
    this.showModal = false;
    this.questionForm.reset();
    this.options.clear();
    this.editingQuestionId = null;
  }

  
  
  

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.questionForm.patchValue({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

}
