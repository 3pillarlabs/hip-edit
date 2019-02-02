// @flow

import express from 'express';
import {json} from 'body-parser';
import agent from 'supertest';
import {CodeEventsRouter} from './router';
import {EditorEventService} from './service';

describe(CodeEventsRouter.name, () => {
  let app: express = null;
  let editorEventService: EditorEventService;

  beforeEach(() => {
    app = express();
    app.use(json());
    editorEventService = jasmine.createSpyObj(EditorEventService.name, ['queue']);
  });

  it('should initialize', () => {
    editorEventService.queue.and.callFake(() => new Promise((resolve, reject) => resolve()));
    app.use('/', new CodeEventsRouter(editorEventService).router());
    expect(app).toBeTruthy();
  });

  it('should handle POST /', () => {
    editorEventService.queue.and.callFake(() => new Promise((resolve, reject) => resolve()));
    app.use('/', new CodeEventsRouter(editorEventService).router());
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
