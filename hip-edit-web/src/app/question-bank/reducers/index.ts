import { ActionReducerMap, MetaReducer, createFeatureSelector } from '@ngrx/store';

import { environment } from '../../../environments/environment';
import { QuestionBoard, reducer as boardReducer } from './board.reducer';

export interface State {
  board: QuestionBoard
}

export const reducers: ActionReducerMap<State> = {
  board: boardReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

export const questionBankSelector = createFeatureSelector<State>('questionBank');
