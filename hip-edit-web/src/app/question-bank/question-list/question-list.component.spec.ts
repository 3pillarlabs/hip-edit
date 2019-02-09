import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, combineReducers, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { MaterialModule } from '../../material.module';
import { QuestionBankService } from '../question-bank.service';
import { QuestionListComponent } from './question-list.component';

import * as fromRoot from '../../reducers';
import * as fromFeature from '../reducers';
import { FirstQuestionAction, NoQuestionAction, FirstCategoryAction, SelectQuestionAction } from '../actions';
import { Question } from '../data-model';

describe('QuestionListComponent', () => {
  let component: QuestionListComponent;
  let fixture: ComponentFixture<QuestionListComponent>;
  let mockQuestionBank: { questions: jasmine.Spy };
  let store: Store<Question>;

  const questions = [
    {
      "id": "238304c0-66ff-4574-81ed-08df7dad0ce2",
      "short": "What is the difference between a class and an interface?"
    },
    {
      "id": "4574-81ed-08df7dad0ce2",
      "short": "What is the entry point of execution and why?"
    }
  ];

  beforeEach(async(() => {
    mockQuestionBank = jasmine.createSpyObj('QuestionBankService', ['questions']);
    TestBed.configureTestingModule({
      declarations: [ QuestionListComponent ],
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
    fixture = TestBed.createComponent(QuestionListComponent);
    store = TestBed.get(Store);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch FirstQuestionAction when questions are available', () => {
    const dispatchSpy = spyOn(Store.prototype, 'dispatch').and.callThrough();
    mockQuestionBank.questions.and.returnValue(of(questions));
    store.dispatch(new FirstCategoryAction('java-core'));
    expect(dispatchSpy.calls.mostRecent().args[0] instanceof FirstQuestionAction).toBeTruthy();
  });

  it('should dispatch NoQuestionAction when no questions are available', () => {
    const dispatchSpy = spyOn(Store.prototype, 'dispatch').and.callThrough();
    mockQuestionBank.questions.and.returnValue(of([]));
    store.dispatch(new FirstCategoryAction('java-core'));
    expect(dispatchSpy.calls.mostRecent().args[0] instanceof NoQuestionAction).toBeTruthy();
  });

  it('should compute questionCount', () => {
    expect(component.questionCount).toEqual(0);
    mockQuestionBank.questions.and.returnValue(of(questions));
    store.dispatch(new FirstCategoryAction('java-core'));
    expect(component.questionCount).toEqual(questions.length);
  });

  it('should set streamComplete to true at the end', () => {
    expect(component.streamComplete).toEqual(false);
    mockQuestionBank.questions.and.returnValue(of(questions));
    store.dispatch(new FirstCategoryAction('java-core'));
    expect(component.streamComplete).toEqual(true);
  });

  it('should dispatch SelectQuestionAction on selection of an item', () => {
    const dispatchSpy = spyOn(Store.prototype, 'dispatch').and.callThrough();
    mockQuestionBank.questions.and.returnValue(of(questions));
    store.dispatch(new FirstCategoryAction('java-core'));
    fixture.detectChanges();
    const link: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    link.click();
    expect(dispatchSpy.calls.mostRecent().args[0] instanceof SelectQuestionAction).toBeTruthy();
  });
});
