import { of } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule, combineReducers } from '@ngrx/store';
import { By } from '@angular/platform-browser';

import { MaterialModule } from '../../material.module';

import { CategoryListComponent } from './category-list.component';
import { QuestionBankService } from '../question-bank.service';

import * as fromRoot from '../../reducers';
import * as fromFeature from '../reducers';

describe('CategoryListComponent', () => {
  const categoryData = [
    { "id": "python-core", "title": "Python", "root": "python" },
    { "id": "js-next", "title": "JavaScript ES.Next", "root": "js", "short": "From ES5, ES6 to ES Next" },
  ];
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let mockQuestionBank: {categories: jasmine.Spy};

  beforeEach(async(() => {
    mockQuestionBank = jasmine.createSpyObj('QuestionBankService', ['categories']);
    TestBed.configureTestingModule({
      declarations: [ CategoryListComponent ],
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
    mockQuestionBank.categories.and.returnValue(of(categoryData));
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display categories', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toEqual(categoryData.length);
    links.map((link) => link.nativeElement)
      .forEach((link, key) => expect(link.textContent).toEqual(categoryData[key].title));
  });

  it('should dispatch action on category selection', () => {
    const spy = spyOn(Store.prototype, 'dispatch').and.callThrough();
    const link = fixture.debugElement.query(By.css('a'));
    const nativeLink: HTMLElement = link.nativeElement;
    nativeLink.click();
    expect(spy).toHaveBeenCalled();
  });
});
