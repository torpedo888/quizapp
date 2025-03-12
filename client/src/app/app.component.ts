import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { NavComponent } from './nav/nav.component';
import { AccountService } from './_services/account.service';
import { HomeComponent } from './home/home.component';
import { PhotoManagementComponent } from './admin/photo-management/photo-management.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { QuizComponent } from './quiz/quiz.component'; 
import { FlashcardComponent } from './flashcard/flashcard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    QuestionFormComponent,
    QuestionListComponent,
    NavComponent,
    HomeComponent,
    UserManagementComponent,
    PhotoManagementComponent,
    QuizComponent,
    FlashcardComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private accountService = inject(AccountService);

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);

    this.accountService.currentUser.set(user);
  }
}
