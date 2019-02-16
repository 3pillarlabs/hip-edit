import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';
import { Subject } from 'rxjs';
import { tap, takeUntil, filter } from 'rxjs/operators';

import { State, questionBankSelector } from '../reducers';
import { QuestionBankService } from '../question-bank.service';
import { Question, AnswerRating, QuestionAnswerRatingMap } from '../data-model';
import { PostAnswerAction } from '../actions';

interface QuestionRatingMap {
  questionId: string;
  ratingMap: QuestionAnswerRatingMap;
};

@Component({
  selector: 'app-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit, OnDestroy {
  question: Question;
  ask: boolean = false;
  ratingValue: number = 0;
  askLabel: string = 'ASK';

  private unsubscribe$: Subject<Question> = new Subject();
  private readonly ratingDescriptions = [
    'Could not answer',
    'Answered partially',
    'Answer meets expectations',
    'Answer exceeds expectations'
  ];

  private readonly selectQuestion = (state: State) => questionBankSelector(state).board.selectedQuestionId;
  private readonly selectRatingMap = (state: State) => questionBankSelector(state).board.answers;
  private readonly selectQuestionRatingMap = createSelector(
    this.selectQuestion,
    this.selectRatingMap,
    (selectedQuestionId: string, ratingMap: QuestionAnswerRatingMap) => {
      let result: QuestionRatingMap = { questionId: undefined, ratingMap: ratingMap };
      if (selectedQuestionId) {
        result.questionId = selectedQuestionId;
      }

      return result;
    }
  );

  constructor(private store: Store<State>,
              private questionBank: QuestionBankService) { }

  ngOnInit() {
    this.store
      .select((state) => this.selectQuestionRatingMap(state))
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => {
          this.ask = false;
          this.ratingValue = 0;
          this.askLabel = 'ASK';
        }),
        filter((questionRatingMap) => questionRatingMap.questionId != undefined),
      ).subscribe((questionRatingMap) => {
        if (!this.question || this.question.id != questionRatingMap.questionId) {
          this.questionBank.question(questionRatingMap.questionId)
            .toPromise()
            .then((question) => this.question = question);
        }

        const answered = Object.keys(questionRatingMap.ratingMap).includes(questionRatingMap.questionId);
        if (answered) {
          this.ratingValue = questionRatingMap.ratingMap[questionRatingMap.questionId].rating;
          this.askLabel = 'VIEW';
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onClickAsk(ask: boolean) {
    this.ask = ask;
  }

  ratingDescription(): string {
    return this.ratingDescriptions[this.ratingValue];
  }

  onPost() {
    const answer: AnswerRating = {
      categoryId: this.question.categoryId,
      questionId: this.question.id,
      rating: this.ratingValue,
      questionShort: this.question.short
    };
    this.store.dispatch(new PostAnswerAction(answer));
    this.ask = false;
  }
}
