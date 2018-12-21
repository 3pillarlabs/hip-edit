import express from 'express';
import agent from 'supertest';
import AuthRouter from './router';

describe(AuthRouter, () => {
  let app = null;
  let route = null;

  beforeEach(() => {
    app = express();
    route = new AuthRouter({
      enabled: true,
      db: [{username: 'admin', password: 'password'}],
    }, {
      enabled: true,
      appHost: 'http://localhost:4200',
      clientID: 'spec_client',
      clientSecret: 'spec_secret',
      callbackURL: 'http://localhost:9000/auth/google/callback',
    });
  });

  it('should initialize', () => {
    app.use('/', route.router());
    expect(app).toBeTruthy();
  });

  describe('POST /login', () => {
    beforeEach(() => {
      app.use('/', route.router());
    });

    it('should redirect on success', () => {
      agent(app)
        .post('/login')
        .send({
          userName: 'admin',
          password: 'password',
        })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .end((error, response) => {
          expect(response.status).toBe(302);
          if (error) return error;
        });
    });

    it('should 401 on auth failure', () => {
      agent(app)
        .post('/login')
        .send({
          userName: 'admin',
          password: 'p455w0rd',
        })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .end((error, response) => {
          expect(response.status).toBe(401);
          if (error) return error;
        });
    });
  });

  describe('GET /google', () => {
    it('should redirect to google accounts', () => {
      app.use('/', route.router());
      agent(app)
        .get('/google')
        .end((error, response) => {
          expect(response.status).toBe(302);
          if (error) return error;
        });
    });
  });

  describe('GET /google/callback', () => {
    it('should redirect to application on success', () => {
      spyOn(route.passportRef, 'authenticate').and.returnValue((req, res, next) => next());
      app.use('/', route.router());
      agent(app)
        .get('/google/callback')
        .end((error, response) => {
          expect(error).toBeFalsy();
          if (error) return error;
          expect(response.status).toBe(302);
          expect(response.get('location')).toMatch(new RegExp(route.googleAuthConfig.appHost));
        });
    });
  });
});
