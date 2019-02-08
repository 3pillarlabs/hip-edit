import { CodeSession } from '../domain/data-model';
import { LoginActions, LoginActionTypes } from '../actions/login.actions';

export type SessionState = CodeSession;

export const initialState: CodeSession = {
  loggedIn: false
};

export function reducer(state = initialState, action: LoginActions): CodeSession {
  switch (action.type) {
    case LoginActionTypes.Login: {
      if (action.payload.bearerToken && action.payload.sessionToken) {
        return { ...state, ...action.payload, loggedIn: true };
      }
      return state;
    }
    case LoginActionTypes.Logout: {
      return initialState;
    }
    default:
      return state;
  }
}
