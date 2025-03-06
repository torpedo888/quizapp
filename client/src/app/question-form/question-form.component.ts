import { Component } from '@angular/core';
import { QuestionService } from '../question.service'; // Adjust the path as necessary
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-form',
  standalone: true,
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.css'],
  imports: [FormsModule, CommonModule]
})
export class QuestionFormComponent {
  categoryName: string = ''; // Assuming you'll handle categories as well
  questionText: string = '';
  options: { id: number; text: string }[] = [{ id: 0, text: '' }];
  correctOptionIndex: number | null = null;
  quizId: number = 1; // Set this to the relevant Quiz ID
  categoryId: number = 1;

  constructor(private questionService: QuestionService) {}

  // Adds a new empty option to the options array
  addOption() {
    const newOptionId = this.options.length > 0 ? this.options[this.options.length - 1].id + 1 : 1; // Simple way to assign new ID
    this.options.push({ id: newOptionId, text: '' });
  }

  // Removes an option from the options array
  removeOption(index: number) {
    this.options.splice(index, 1);
  }

  onSubmit() {
    // Constructing the data object
    // const formData: Question = {
    //   id: 0, // Set to 0 or leave undefined if you're creating a new question
    //   text: this.questionText,
    //   correctOptionId: this.correctOptionIndex !== null ? this.options[this.correctOptionIndex].id : 0, // Set correctOptionId based on the selected option
    //   quizId: this.quizId,
    //   categoryId: this.categoryId
    // };

   // console.log('Form Data:', JSON.stringify(formData, null, 2));

    // // Using the QuestionService to save the question
    // this.questionService.saveQuestion(formData).subscribe(
    //   response => {
    //     // Handle success
    //     console.log('Question saved!', response);
    //   },
    //   error => {
    //     // Handle error
    //     console.error('Error saving question', error);
    //   }
    // );
  }
}
