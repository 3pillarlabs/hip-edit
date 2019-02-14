import { Action } from '@ngrx/store';
import { AnswerRating } from './data-model';

export enum QuestionBankActionTypes {
  SelectCategory = '[QuestionBank Category] Select',
  FirstCategory = '[QuestionBank Category] First',
  SelectQuestion = '[QuestionBank Question] Select',
  FirstQuestion = '[QuestionBank Question] First',
  NoQuestion = '[QuestionBank Question] None',
  PostAnswer = '[QuestionBank Question] Answer'
}

export class SelectCategoryAction implements Action {
  readonly type = QuestionBankActionTypes.SelectCategory;
  constructor(public payload: string) {}
}

export class FirstCategoryAction implements Action {
  readonly type = QuestionBankActionTypes.FirstCategory;
  constructor(public payload: string) {}
}

export class SelectQuestionAction implements Action {
  readonly type = QuestionBankActionTypes.SelectQuestion;
  constructor(public payload: string) {}
}

export class FirstQuestionAction implements Action {
  readonly type = QuestionBankActionTypes.FirstQuestion;
  constructor(public payload: string) {}
}

export class NoQuestionAction implements Action {
  readonly type = QuestionBankActionTypes.NoQuestion;
}

export class PostAnswerAction implements Action {
  readonly type = QuestionBankActionTypes.PostAnswer;
  constructor(public payload: AnswerRating) {}
}

export type QuestionBankActions = SelectCategoryAction |
                                  FirstCategoryAction |
                                  SelectQuestionAction |
                                  FirstQuestionAction |
                                  NoQuestionAction |
                                  PostAnswerAction;