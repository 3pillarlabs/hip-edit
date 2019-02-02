// @flow

import jwt from 'jsonwebtoken';
import {AuthService} from './auth-service';
import {logger} from '../logging';

describe(AuthService.name, () => {
  let service: AuthService;
  beforeEach(() => {
    service = new AuthService();
  });

  describe('#verifyBearerToken', () => {
    it('should successfully verify authentic token', (done) => {
      const sessionToken = service.generateSessionToken();
      const secretKey = 'blah';
      const issuer = '//baz';
      service.generateBearerToken(sessionToken, {secretKey: secretKey, expiresIn: 10, issuer: issuer})
        .then((bearerToken) => {
          logger.debug(bearerToken);
          return service.verifyBearerToken(bearerToken, {secretKey, issuer});
        })
        .then((decoded) => {
          logger.debug(decoded);
          expect(decoded.nonce).toBe(sessionToken);
        })
        .then(done);
    });
    it('should reject an invalid token', (done) => {
      spyOn(jwt, 'verify')
        .and
        .callFake((token, secret, options, cb: Function) => cb({
          name: 'TokenExpiredError',
          message: 'jwt expired',
        }, null));
      service.verifyBearerToken('abc', {secretKey: 'blah', issuer: 'baz'})
        .then(() => fail('Expected reject, but resolve was called instead'))
        .catch((error) => {
          expect(error).toBeTruthy();
        })
        .then(done);
    });
  });
});
