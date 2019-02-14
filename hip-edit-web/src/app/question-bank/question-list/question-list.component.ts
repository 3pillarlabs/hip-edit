import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { switchMap, tap, filter, delay } from 'rxjs/operators';

import { Question } from '../data-model';
import { State, questionBankSelector } from '../reducers';
import { SelectQuestionAction, FirstQuestionAction, NoQuestionAction } from '../actions';
import { QuestionBankService } from '../question-bank.service';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {
  questionList$: Observable<Question[]>;
  questionCount: number = 0;
  streamComplete: boolean = false;

  constructor(private store: Store<State>,
              private questionBank: QuestionBankService) { }

  ngOnInit() {
    this.questionList$ = this.store
      .select((state) => questionBankSelector(state).board.selectedCategoryId)
      .pipe(
        filter((categoryId) => categoryId != undefined),
        switchMap((categoryId) => this.questionBank.questions(categoryId)),
        tap((questions) => {
          this.questionCount = questions.length;
          if (this.questionCount > 0) {
            this.store.dispatch(new FirstQuestionAction(questions[0].id));
          } else {
            this.store.dispatch(new NoQuestionAction());
          }
          this.streamComplete = true;
        })
      );
  }

  onSelectQuestion(questionId: string) {
    this.store.dispatch(new SelectQuestionAction(questionId));
    return false;
  }
}
