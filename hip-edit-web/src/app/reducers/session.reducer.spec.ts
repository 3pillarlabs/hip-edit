import { reducer, initialState } from './session.reducer';
import { LogoutAction } from '../actions/login.actions';

describe('Session Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });

  describe('logout action', () => {
    it('should return to initial state', () => {
      const action = new LogoutAction();
      const result = reducer({loggedIn: true, sessionToken: 'foo', bearerToken: 'bar'}, action);
      expect(result).toEqual(initialState);
    });
  });
});
