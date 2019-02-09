import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { EMPTY, Subject } from 'rxjs';
import { tap, switchMap, takeUntil } from 'rxjs/operators';

import { State, questionBankSelector } from '../reducers';
import { QuestionBankService } from '../question-bank.service';
import { Question } from '../data-model';

@Component({
  selector: 'app-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit, OnDestroy {
  question: Question | void;
  unsubscribe$: Subject<Question> = new Subject();

  constructor(private store: Store<State>,
              private questionBank: QuestionBankService) { }

  ngOnInit() {
    this.store
      .select((state) => questionBankSelector(state).board.selectedQuestionId)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((questionId) => {
          if (!questionId) {
            this.question = null;
          }
        }),
        switchMap((questionId) => {
          if (questionId) {
            return this.questionBank.question(questionId);
          } else {
            return EMPTY;
          }
        })
      ).subscribe((question) => this.question = question);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
