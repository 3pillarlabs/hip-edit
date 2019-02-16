import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { QuestionBankComponent } from './question-bank.component';
import { CategoryListComponent } from '../category-list/category-list.component';
import { QuestionListComponent } from '../question-list/question-list.component';
import { QuestionDetailComponent } from '../question-detail/question-detail.component';
import { MatDialog } from '@angular/material';
import { StoreModule, combineReducers } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as fromFeature from '../reducers';
import { MaterialModule } from '../../material.module';
import { ScoreCard, QuestionAnswerRatingMap } from '../data-model';

describe('QuestionBankComponent', () => {
  let component: QuestionBankComponent;
  let fixture: ComponentFixture<QuestionBankComponent>;
  let matDialogSpy: {open: jasmine.Spy}

  beforeEach(async(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      declarations: [
        QuestionBankComponent,
        MockComponent(CategoryListComponent),
        MockComponent(QuestionListComponent),
        MockComponent(QuestionDetailComponent)
      ],
      imports: [
        MaterialModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          questionBank: combineReducers(fromFeature.reducers)
        })
      ],
      providers: [
        {
          provide: MatDialog,
          useValue: matDialogSpy
        }
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

  const ratingMap: QuestionAnswerRatingMap = {
    '1': { questionId: '1', categoryId: 'java-core', rating: 1, questionShort: 'yada' },
    '2': { questionId: '2', categoryId: 'java-core', rating: 2, questionShort: 'yada' },
    '3': { questionId: '3', categoryId: 'python', rating: 2, questionShort: 'yada' },
    '4': { questionId: '4', categoryId: 'flask', rating: 3, questionShort: 'yada' }
  };

  describe('#transform', () => {
    it('should be empty for no ratings', () => {
      expect(component.transform({})).toEqual({});
    });
    describe('for some ratings', () => {
      let scoreCard: ScoreCard;
      beforeEach(() => {
        scoreCard = component.transform(ratingMap);
      });
      it('should group questions by category', () => {
        const card = scoreCard['java-core']
        expect(card.length).toEqual(2);
        expect(card[0]).toEqual(ratingMap['1']);
        expect(card[1]).toEqual(ratingMap['2']);
        expect(scoreCard['python'][0]).toEqual(ratingMap['3']);
        expect(scoreCard['flask'][0]).toEqual(ratingMap['4']);
      });
      it('should maintain separate categories', () => {
        expect(Object.keys(scoreCard).length).toEqual(3);
      });
    });
  });

  describe('#updateScoreCard', () => {
    it('should mutate the component scorecard', () => {
      component.updateScoreCard({'1': ratingMap['1']});
      expect(component.scoreCard).toEqual({'java-core': [ratingMap['1']]});
      component.updateScoreCard({ '1': ratingMap['1'], '2': ratingMap['2'] });
      expect(component.scoreCard).toEqual({ 'java-core': [ratingMap['1'], ratingMap['2']] });
      component.updateScoreCard({'1': ratingMap['1'], '2': ratingMap['2'], '3': ratingMap['3']});
      expect(component.scoreCard).toEqual({'java-core': [ratingMap['1'], ratingMap['2']], 'python': [ratingMap['3']]});
    });
  });
});
