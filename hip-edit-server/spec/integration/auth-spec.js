import process from 'process';
import agent from 'superagent';
import AppConfig from '../../dist/modules/app-config';
import logger from '../../dist/modules/logging';

describe('Authentication Tests', () => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${AppConfig.serverPort}`;

  describe('POST /auth/login', () => {
    it('should redirect on successful login', (done) => {
      agent
        .post(`${baseUrl}/auth/login`)
        .redirects(0)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
        .send('userName=admin&password=password')
        .ok((res) => res.status == 302)
        .end((error, response) => {
          if (error) logger.error(error);
          expect(error).toBeFalsy();
          expect(response.status).toEqual(302);
          done(error);
        });
    });
  });
});
