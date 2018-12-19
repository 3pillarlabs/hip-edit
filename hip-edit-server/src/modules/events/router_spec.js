import express from 'express';
import {json} from 'body-parser';
import agent from 'supertest';
import CodeEventsRouter from './router';
import EditorEventService from './service';

describe(CodeEventsRouter, () => {
  let app = null;
  let editorEventService = null;

  beforeEach(() => {
    app = express();
    app.use(json());
    editorEventService = jasmine.createSpyObj(EditorEventService, {
      queue: jasmine.createSpyObj('FakePromise', {
        then: jasmine.createSpyObj('AnotherFakePromise', ['catch']),
      }),
    });
    app.use('/', new CodeEventsRouter(editorEventService).router());
  });

  it('should initialize', () => {
    expect(app).toBeTruthy();
  });

  it('should handle POST /', () => {
    agent(app)
      .post('/')
      .send({
        sessionToken: '90c01e9a-9401-4953-a0c8-f5d434d76b4d',
        eventType: 'newText',
        text: 'class Foo',
      })
      .set('Content-Type', 'application/json')
      .expect(201)
      .end((error, response) => {
        if (error) return error;
      });
  });
});
