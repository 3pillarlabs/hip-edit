import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, combineReducers, Store } from '@ngrx/store';
import { of, EMPTY } from 'rxjs';

import { MaterialModule } from '../../material.module';
import { QuestionBankService } from '../question-bank.service';
import { QuestionDetailComponent } from './question-detail.component';

import * as fromRoot from '../../reducers';
import * as fromFeature from '../reducers';
import { Question } from '../data-model';
import { SelectQuestionAction, PostAnswerAction } from '../actions';
import { By } from '@angular/platform-browser';

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

  it('should set the question', async () => {
    expect(component.question).toBeFalsy();
    mockQuestionBank.question.and.returnValue(of(question));
    store.dispatch(new SelectQuestionAction(question['id']));
    return fixture.whenStable()
      .then(() => {
        expect(component.question).toEqual(question);
        fixture.detectChanges();
        const titleNe: HTMLElement = fixture.debugElement.query(By.css('mat-card-title')).nativeElement;
        expect(titleNe.textContent).toEqual(question.short);
      });
  });

  it('should set defaults for question not rated', async () => {
    mockQuestionBank.question.and.returnValue(of(question));
    store.dispatch(new SelectQuestionAction(question['id']));
    return fixture.whenStable()
      .then(() => {
        expect(component.ask).toBeFalsy();
        expect(component.ratingValue).toEqual(0);
        fixture.detectChanges();
        const askNe: HTMLElement = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(askNe.textContent).toMatch(/ask/i);
      });
  });

  it('should set the values for a question rated', async () => {
    mockQuestionBank.question.and.returnValue(of(question));
    store.dispatch(new SelectQuestionAction(question.id));
    const answer = { categoryId: question.categoryId, questionId: question.id, rating: 3 };
    store.dispatch(new PostAnswerAction(answer));
    return fixture.whenStable()
      .then(() => {
        expect(component.ask).toBeFalsy();
        expect(component.ratingValue).toEqual(answer.rating);
        fixture.detectChanges();
        const askNe: HTMLElement = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(askNe.textContent).toMatch(/view/i);
      });
  });

  it('should change questions and ratings for each question', async () => {
    const nextQuestion = {
      "id": "828005c1",
      "categoryId": "spring-core",
      "short": "What is the difference between named versus type injection?"
    };
    const actions = [
      { categoryId: question.categoryId, questionId: question.id, rating: 3 },
      { categoryId: nextQuestion.categoryId, questionId: nextQuestion.id, rating: 1 }
    ];
    mockQuestionBank.question.and.callFake((questionId: string) => {
      if (questionId == question.id) {
        return of(question);
      } else if (questionId == nextQuestion.id) {
        return of(nextQuestion);
      } else {
        return EMPTY;
      }
    });

    store.dispatch(new SelectQuestionAction(question.id));
    store.dispatch(new PostAnswerAction(actions[0]));
    store.dispatch(new SelectQuestionAction(nextQuestion.id));
    store.dispatch(new PostAnswerAction(actions[1]));
    store.dispatch(new SelectQuestionAction(question.id));
    return fixture.whenStable()
      .then(async () => {
        expect(component.question.id).toEqual(question.id);
        expect(component.ratingValue).toEqual(actions[0].rating);
        fixture.detectChanges();
        const titleNe: HTMLElement = fixture.debugElement.query(By.css('mat-card-title')).nativeElement;
        expect(titleNe.textContent).toEqual(question.short);
        store.dispatch(new SelectQuestionAction(nextQuestion.id));
        return fixture.whenStable()
          .then(() => {
            expect(component.question.id).toEqual(nextQuestion.id);
            expect(component.ratingValue).toEqual(actions[1].rating);
            fixture.detectChanges();
            const titleNe: HTMLElement = fixture.debugElement.query(By.css('mat-card-title')).nativeElement;
            expect(titleNe.textContent).toEqual(nextQuestion.short);
          });
      });
  });

  describe('ratingDescription', () => {
    it('should return appropriate descriptions', () => {
      for (let value = 0; value < 4; value++) {
        component.ratingValue = value;
        expect(component.ratingDescription()).toBeTruthy();
      }
    });
  });
});
