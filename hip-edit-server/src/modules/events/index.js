// @flow

import express from 'express';
import topicServiceFactory from '../messaging/factory';
import EditorEventService from './service';
import CodeEventsRouter from './router';
import AppConfig from '../app-config';

/**
 * Mounts the Express app with prefix
 * @param {express} app
 */
export default function _codeEventsRoute(app: express) {
  const editorEventService = new EditorEventService(topicServiceFactory(AppConfig.messaging));
  const codeEventsRouter = new CodeEventsRouter(editorEventService);
  app.use('/events', codeEventsRouter.router());
}
