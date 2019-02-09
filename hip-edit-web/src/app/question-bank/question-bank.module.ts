import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';

import { MaterialModule } from '../material.module';

import { QuestionBankService } from './question-bank.service';

import { QuestionBankComponent } from './question-bank/question-bank.component';
import { CategoryListComponent } from './category-list/category-list.component';
import * as fromBoard from './reducers';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionDetailComponent } from './question-detail/question-detail.component';

const routes: Routes = [
  {
    path: 'question-bank',
    component: QuestionBankComponent
  }
];

@NgModule({
  declarations: [
    QuestionBankComponent,
    CategoryListComponent,
    QuestionListComponent,
    QuestionDetailComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('questionBank', fromBoard.reducers, { metaReducers: fromBoard.metaReducers })
  ],
  providers: [
    QuestionBankService
  ]
})
export class QuestionBankModule { }
