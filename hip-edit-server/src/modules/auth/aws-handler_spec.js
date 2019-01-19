
import {createHandler} from './aws-handler';
import {AuthService} from './auth-service';

describe(createHandler.name, () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('service.verifyBearerToken OK', () => {
    it('should invoke callback', (done) => {
      spyOn(AuthService.prototype, 'verifyBearerToken').and.callFake(() => new Promise((resolve, reject) => {
        resolve({});
      }));
      const handler = createHandler(authService);
      const callback = jasmine.createSpy('callback');
      handler({authorizationToken: 'bearerToken', methodArn: 'arn:aws:api'}, {}, callback)
        .then(() => {
          expect(callback).toHaveBeenCalled();
          expect(callback.calls.first().args[0]).toBeNull();
          done();
        })
        .catch((error) => done(error));
    });
  });
});
