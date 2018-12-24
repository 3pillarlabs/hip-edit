import express from 'express';
import agent from 'supertest';
import AuthRouter from './router';
import TopicService from '../messaging/topic-service';

describe(AuthRouter, () => {
  let app = null;
  let route = null;
  let topicService = null;

  beforeEach(() => {
    app = express();
    topicService = new TopicService();
    route = new AuthRouter(topicService, {
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
    it('should redirect on success', (done) => {
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
          done(error);
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
          done(error);
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
          done(error);
        });
    });
  });

  describe('GET /google/callback', () => {
    it('should redirect to application on success', (done) => {
      spyOn(TopicService.prototype, 'createTopic').and.callFake(() => new Promise((resolve, _reject) => {
        resolve();
      }));
      spyOn(route.passportRef, 'authenticate').and.returnValue((req, res, next) => next());
      app.use('/', route.router());
      agent(app)
        .get('/google/callback')
        .end((error, response) => {
          expect(error).toBeFalsy();
          expect(response.status).toBe(302);
          expect(response.get('location')).toMatch(new RegExp(route.googleAuthConfig.appHost));
          done(error);
        });
    });
  });

  describe('POST /join', () => {
    it('should respond with 200 OK if session exists', (done) => {
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
          done(error);
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
          done(error);
        });
    });
  });
});
