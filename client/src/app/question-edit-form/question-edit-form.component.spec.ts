import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionEditFormComponent } from './question-edit-form.component';

describe('QuestionEditFormComponent', () => {
  let component: QuestionEditFormComponent;
  let fixture: ComponentFixture<QuestionEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionEditFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestionEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
