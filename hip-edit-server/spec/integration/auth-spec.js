import process from 'process';
import agent from 'superagent';
import AppConfig from '../../dist/modules/app-config';

describe('Authentication Tests', () => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${AppConfig.serverPort}`;

  describe('POST /auth/login', () => {
    it('should redirect on successful login', (done) => {
      agent
        .post(`${baseUrl}/auth/login`)
        .redirects(0)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
        .send('userName=admin&password=password')
        .end((error, response) => {
          expect(response.statusCode).toEqual(302);
          done();
        });
    });
  });
});
