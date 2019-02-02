import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromSession from './session.reducer';

export interface State {
  session: fromSession.SessionState;
}

export const reducers: ActionReducerMap<State> = {
  session: fromSession.reducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
