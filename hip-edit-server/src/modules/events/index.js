// @flow

import type express from 'express';
import {topicServiceFactory} from '../messaging/factory';
import {EditorEventService} from './service';
import {CodeEventsRouter} from './router';
import {AppConfig} from '../app-config';

/**
 * Mounts the Express app with prefix
 * @param {express} app
 * @param {string} mountPath
 */
export function codeEventsRoute(app: express, mountPath: string) {
  const editorEventService = new EditorEventService(topicServiceFactory(AppConfig.messaging));
  const codeEventsRouter = new CodeEventsRouter(editorEventService);
  app.use(mountPath, codeEventsRouter.router());
}
