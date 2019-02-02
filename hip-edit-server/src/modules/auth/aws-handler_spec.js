// @flow

import {createHandler} from './aws-handler';
import {AuthService} from './auth-service';
import {toError} from '../app-error';

describe(createHandler.name, () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('verifyBearerToken OK', () => {
    it('should invoke callback with policy', (done) => {
      spyOn(AuthService.prototype, 'verifyBearerToken').and.callFake(() => new Promise((resolve, reject) => {
        resolve({});
      }));
      const handler = createHandler(authService);
      const callback = jasmine.createSpy('callback');
      handler({authorizationToken: 'bearerToken', methodArn: 'arn:aws:api'}, {}, callback)
        .then(() => {
          expect(callback).toHaveBeenCalled();
          expect(callback.calls.first().args[0]).toBeNull();
          expect(callback.calls.first().args[1]).toBeTruthy();
          done();
        })
        .catch((error) => fail(error));
    });
  });

  describe('verifyBearerToken FAIL', () => {
    it('should invoke callback with Unauthorized message', (done) => {
      spyOn(AuthService.prototype, 'verifyBearerToken').and.callFake(() => new Promise((resolve, reject) => {
        reject(toError({name: 'JsonWebTokenError', message: 'jwt malformed'}));
      }));
      const handler = createHandler(authService);
      const callback = jasmine.createSpy('callback');
      handler({authorizationToken: 'bearerToken', methodArn: 'arn:aws:api'}, {}, callback)
        .then(() => {
          expect(callback).toHaveBeenCalled();
          const error = callback.calls.first().args[0];
          expect(error).toBeTruthy();
          done();
        })
        .catch((error) => fail(error));
    });
  });
});
