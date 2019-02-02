import { Action } from '@ngrx/store';
import { CodeSession } from '../join-session/data-model';

export enum LoginActionTypes {
  Login = '[Join Session] Login'
}

export class LoginAction implements Action {
  readonly type = LoginActionTypes.Login;
  constructor(public payload: CodeSession) {}
}

export type LoginActions = LoginAction;
