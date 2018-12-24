// @flow

import express from 'express';
import AuthRouter from './router';
import topicServiceFactory from '../messaging/factory';
import AppConfig from '../app-config';

/**
 * Mounts Express app
 * @param {express} app
 */
export default function _authRoute(app: express) {
  const topicService = topicServiceFactory(AppConfig.messaging);
  const route = new AuthRouter(topicService);
  app.use('/auth', route.router());
}
