// @flow

import express from 'express';
import agent from 'supertest';
import passport from 'passport';
import {URL} from 'url';
import {AuthRouter} from './router';
import {TopicService} from '../messaging/topic-service';
import {AuthService} from './auth-service';

describe(AuthRouter.name, () => {
  let app: express;
  let route: AuthRouter;
  let topicService = null;
  let authService = null;

  beforeEach(() => {
    app = express();
    topicService = new TopicService();
    authService = new AuthService();
    route = new AuthRouter(topicService, authService);
    route.localAuthConfig = {
      enabled: true,
      db: [{username: 'admin', password: 'password'}],
    };

    route.googleAuthConfig = {
      enabled: true,
      clientID: 'spec_client',
      clientSecret: 'spec_secret',
      callbackURL: 'http://localhost:9000/auth/google/callback',
    };

    route.appHost = 'http://localhost:4200';
  });

  it('should initialize', () => {
    app.use('/', route.router());
    expect(app).toBeTruthy();
  });

  describe('POST /login', () => {
    it('should redirect on success', (done) => {
      const fakeSessionToken = 'a1b2c3';
      const fakeBearerToken = 'x1y2z3';
      spyOn(AuthService.prototype, 'generateSessionToken').and.returnValue(fakeSessionToken);
      spyOn(AuthService.prototype, 'generateBearerToken').and.callFake(() => new Promise((resolve, _reject) => {
        resolve(fakeBearerToken);
      }));
      spyOn(TopicService.prototype, 'createTopic').and.callFake(() => new Promise((resolve, _reject) => {
        resolve();
      }));
      app.use('/', route.router());
      agent(app)
        .post('/login')
        .send({
          userName: 'admin',
          password: 'password',
        })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .end((error, response) => {
          expect(response.status).toBe(302);
          const redirectURL = new URL(response.header['location']);
          expect(redirectURL.searchParams.get('sessionToken')).toBe(fakeSessionToken);
          expect(redirectURL.searchParams.get('bearerToken')).toBe(fakeBearerToken);
          done();
        });
    });

    it('should 401 on auth failure', (done) => {
      app.use('/', route.router());
      agent(app)
        .post('/login')
        .send({
          userName: 'admin',
          password: 'p455w0rd',
        })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .end((error, response) => {
          expect(response.status).toBe(401);
          done();
        });
    });
  });

  describe('GET /google', () => {
    it('should redirect to google accounts', (done) => {
      app.use('/', route.router());
      agent(app)
        .get('/google')
        .end((error, response) => {
          expect(response.status).toBe(302);
          done();
        });
    });
  });

  describe('GET /google/callback', () => {
    it('should redirect to application on success', (done) => {
      const fakeSessionToken = 'a1b2c3';
      const fakeBearerToken = 'x1y2z3';
      spyOn(AuthService.prototype, 'generateSessionToken').and.returnValue(fakeSessionToken);
      spyOn(AuthService.prototype, 'generateBearerToken').and.callFake(() => new Promise((resolve, _reject) => {
        resolve(fakeBearerToken);
      }));
      spyOn(TopicService.prototype, 'createTopic').and.callFake(() => new Promise((resolve, _reject) => {
        resolve();
      }));
      spyOn(passport, 'authenticate').and.returnValue((req, res, next) => next());
      app.use('/', route.router());
      agent(app)
        .get('/google/callback')
        .end((error, response) => {
          expect(error).toBeFalsy();
          expect(response.status).toBe(302);
          const redirectURL = new URL(response.header['location']);
          expect(redirectURL.searchParams.get('sessionToken')).toBe(fakeSessionToken);
          expect(redirectURL.searchParams.get('bearerToken')).toBe(fakeBearerToken);
          expect(redirectURL.host).toEqual((new URL(route.appHost)).host);
          done();
        });
    });
  });

  describe('POST /join', () => {
    it('should respond with 200 OK if session exists', (done) => {
      const fakeBearerToken = 'x1y2z3';
      spyOn(AuthService.prototype, 'generateBearerToken').and.callFake(() => new Promise((resolve, _reject) => {
        resolve(fakeBearerToken);
      }));
      spyOn(TopicService.prototype, 'trySubscribeTopic').and.callFake(() => new Promise((resolve, _reject) => {
        resolve();
      }));
      app.use('/', route.router());
      agent(app)
        .post('/join')
        .send({
          sessionToken: '90c01e9a-9401-4953-a0c8-f5d434d76b4d',
          name: '@foo',
        })
        .set('Content-Type', 'application/json')
        .end((error, response) => {
          expect(response.status).toBe(200);
          expect(response.body.bearerToken).toBe(fakeBearerToken);
          done();
        });
    });

    it('should respond with 401 Unauthorized if session does not exist', (done) => {
      spyOn(TopicService.prototype, 'trySubscribeTopic').and.callFake(() => new Promise((_resolve, reject) => {
        reject(new Error('fake error'));
      }));
      app.use('/', route.router());
      agent(app)
        .post('/join')
        .send({
          sessionToken: '90c01e9a-9401-4953-a0c8-f5d434d76b4d',
          name: '@foo',
        })
        .set('Content-Type', 'application/json')
        .end((error, response) => {
          expect(response.status).toBe(401);
          done();
        });
    });
  });

  describe('HEAD /verify', () => {
    it('should respond with 200 if verification succeeds', (done) => {
      spyOn(AuthService.prototype, 'verifyBearerToken').and.callFake(() => new Promise((resolve, reject) => {
        resolve({nonce: 'payload'});
      }));
      app.use('/', route.router());
      agent(app)
        .head(`/verify?bearerToken=ok&sessionToken=payload`)
        .end((error, response) => {
          expect(response.status).toBe(200);
          done();
        });
    });
    it('should respond with 401 if payload verification fails', (done) => {
      spyOn(AuthService.prototype, 'verifyBearerToken').and.callFake(() => new Promise((resolve, reject) => {
        resolve({nonce: 'fakePayload'});
      }));
      app.use('/', route.router());
      agent(app)
        .head(`/verify?bearerToken=notok&sessionToken=payload`)
        .end((error, response) => {
          expect(response.status).toBe(401);
          done();
        });
    });
    it('should respond with 401 if token verification fails', (done) => {
      spyOn(AuthService.prototype, 'verifyBearerToken').and.callFake(() => new Promise((resolve, reject) => {
        reject(new Error('Malformed mock token'));
      }));
      app.use('/', route.router());
      agent(app)
        .head(`/verify?bearerToken=notok&sessionToken=payload`)
        .end((error, response) => {
          expect(response.status).toBe(401);
          done();
        });
    });
  });
});
