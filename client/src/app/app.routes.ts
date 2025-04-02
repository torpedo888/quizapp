import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { authGuard } from './_guards/auth.guard';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { adminGuard } from './_guards/admin.guard';
import { QuizComponent } from './quiz/quiz.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { QuizFormComponent } from './quiz-form/quiz-form.component'; 
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { QuestionListEditComponent } from './question-list-edit/question-list-edit.component';
import { QuestionDeleteComponent } from './question-delete/question-delete.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';
import { QuizEditComponent } from './quiz-edit/quiz-edit.component';

export const routes: Routes = [
  { path: '', component: CategoryListComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'members', component: MemberListComponent },
      { path: 'members/:id', component: MemberDetailComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'quiz', component: CategoryListComponent },
      { path: 'quiz/:id', component: QuestionListComponent },
      { path: 'quiz-result', component: QuizResultComponent },
      { path: 'addquestion', component: QuestionFormComponent },
      { path: 'editquestion', component: QuestionListEditComponent },
      { path: 'deletequestion', component: QuestionDeleteComponent },
      { path: '', component: CategoryListComponent }, // Homepage
      { path: 'categories', component: CategoryListComponent },
      { path: 'category-form', component: CategoryFormComponent }, // Add category
      { path: 'category-form/:id', component: CategoryFormComponent }, // Edit category
      { path: 'edit-categories', component: CategoryEditComponent },
      { path: 'quiz-form', component: QuizFormComponent }, // 👈 Add new route for creating a quiz
      { path: 'quiz-form/:id', component: QuizFormComponent }, // 👈 Add new route for editing a quiz
      { path: 'quiz-list/:categoryId', component: QuizListComponent },
      { path: 'quiz-edit', component: QuizEditComponent},
      { path: 'admin', component: AdminPanelComponent, canActivate: [adminGuard]}
    ],
  },
  { path: 'errors', component: TestErrorsComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];
