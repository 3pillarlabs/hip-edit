import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, combineReducers, Store } from '@ngrx/store';
import { of } from 'rxjs';

import { MaterialModule } from '../../material.module';
import { QuestionBankService } from '../question-bank.service';
import { QuestionDetailComponent } from './question-detail.component';

import * as fromRoot from '../../reducers';
import * as fromFeature from '../reducers';
import { Question } from '../data-model';
import { SelectQuestionAction } from '../actions';

describe('QuestionDetailComponent', () => {
  let component: QuestionDetailComponent;
  let fixture: ComponentFixture<QuestionDetailComponent>;
  let mockQuestionBank: { question: jasmine.Spy };
  let store: Store<Question>;
  const question = {
    "id": "238304c0",
    "categoryId": "spring-core",
    "short": "What are the different types of injection supported by Spring?",
    "tags": ["java", "spring"],
    "expect": {
      "meet": [
        "Setter injection"
      ],
      "exceed": [
        "Constructor injection"
      ]
    }
  };

  beforeEach(async(() => {
    mockQuestionBank = jasmine.createSpyObj('QuestionBankService', ['question']);
    TestBed.configureTestingModule({
      declarations: [ QuestionDetailComponent ],
      imports: [
        MaterialModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          questionBank: combineReducers(fromFeature.reducers)
        })
      ],
      providers: [
        {
          provide: QuestionBankService,
          useValue: mockQuestionBank
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(QuestionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the question', () => {
    expect(component.question).toBeNull();
    mockQuestionBank.question.and.returnValue(of(question));
    store.dispatch(new SelectQuestionAction(question['id']));
    expect(component.question).toEqual(question);
  });
});
