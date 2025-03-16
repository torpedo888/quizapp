import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionListEditComponent } from './question-list-edit.component';

describe('QuestionListEditComponent', () => {
  let component: QuestionListEditComponent;
  let fixture: ComponentFixture<QuestionListEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestionListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
