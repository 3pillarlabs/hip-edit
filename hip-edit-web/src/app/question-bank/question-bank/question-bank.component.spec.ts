import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { QuestionBankComponent } from './question-bank.component';
import { CategoryListComponent } from '../category-list/category-list.component';
import { QuestionListComponent } from '../question-list/question-list.component';
import { QuestionDetailComponent } from '../question-detail/question-detail.component';

describe('QuestionBankComponent', () => {
  let component: QuestionBankComponent;
  let fixture: ComponentFixture<QuestionBankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        QuestionBankComponent,
        MockComponent(CategoryListComponent),
        MockComponent(QuestionListComponent),
        MockComponent(QuestionDetailComponent)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
