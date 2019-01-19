import {AuthService} from './auth-service';
import {logger} from '../logging';

describe(AuthService.name, () => {
  let service = null;
  beforeEach(() => {
    service = new AuthService();
  });

  describe('#verifyBearerToken', () => {
    it('should successfully verify authentic token', () => {
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
        });
    });
  });
});
