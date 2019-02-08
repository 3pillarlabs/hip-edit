import { Action } from '@ngrx/store';
import { CodeSession } from '../domain/data-model';

export enum LoginActionTypes {
  Login = '[Join Session] Login',
  Logout = '[Join Session] Logout',
}

export class LoginAction implements Action {
  readonly type = LoginActionTypes.Login;
  constructor(public payload: CodeSession) {}
}

export class LogoutAction implements Action {
  readonly type = LoginActionTypes.Logout;
}

export type LoginActions = LoginAction | LogoutAction;
