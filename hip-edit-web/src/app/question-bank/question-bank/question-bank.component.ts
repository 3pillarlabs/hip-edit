import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ScoreCardComponent } from '../score-card/score-card.component';
import { Store } from '@ngrx/store';
import { State, questionBankSelector } from '../reducers';
import { Subject } from 'rxjs';
import { QuestionAnswerRatingMap, ScoreCard, AnswerRating } from '../data-model';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-question-bank',
  templateUrl: './question-bank.component.html',
  styleUrls: ['./question-bank.component.scss']
})
export class QuestionBankComponent implements OnInit, OnDestroy {
  private dialogRef: MatDialogRef<ScoreCardComponent, void>;
  private unsubscribe$: Subject<QuestionAnswerRatingMap> = new Subject();
  public scoreCard: ScoreCard = {};

  constructor(public dialog: MatDialog,
              private store: Store<State>) { }

  ngOnInit() {
    const answers$ = this.store.select((state) => questionBankSelector(state).board.answers);
    answers$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((ratingMap) => {
        setTimeout(() => this.updateScoreCard(ratingMap));
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onScorecardClick() {
    this.dialogRef = this.dialog.open(ScoreCardComponent, { closeOnNavigation: true, data: this.scoreCard });
  }

  transform(ratingMap: QuestionAnswerRatingMap): ScoreCard {
    return _.groupBy(Object.values(ratingMap), (value: AnswerRating) => value.categoryId);
  }

  updateScoreCard(ratingMap: QuestionAnswerRatingMap) {
    _.merge(this.scoreCard, this.transform(ratingMap));
  }
}
