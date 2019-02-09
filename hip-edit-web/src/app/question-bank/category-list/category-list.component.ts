import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { QuestionBankService } from '../question-bank.service';
import { Category } from '../data-model';
import { State } from '../reducers';
import { SelectCategoryAction, FirstCategoryAction } from '../actions';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories$: Observable<Category[]>;
  private firstCategoryActionDispatched: boolean = false;

  constructor(private questionBank: QuestionBankService,
              private store: Store<State>) { }

  ngOnInit() {
    this.categories$ = this.questionBank
      .categories()
      .pipe(
        tap((categories) => {
          if (!this.firstCategoryActionDispatched) {
            this.store.dispatch(new FirstCategoryAction(categories[0].id));
            this.firstCategoryActionDispatched = true;
          }
        })
      );
  }

  onSelectCategory(categoryId: string): boolean {
    this.store.dispatch(new SelectCategoryAction(categoryId));
    return false;
  }
}
