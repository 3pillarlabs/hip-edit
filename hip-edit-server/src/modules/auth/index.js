// @flow

import express from 'express';
import {AuthRouter} from './router';
import {topicServiceFactory} from '../messaging/factory';
import {AppConfig} from '../app-config';
import {AuthService} from './auth-service';

/**
 * Mounts Express app
 * @param {express} app
 * @param {string} mountPath
 */
export function authRoute(app: express, mountPath: string) {
  const topicService = topicServiceFactory(AppConfig.messaging);
  const authService = new AuthService();
  const route = new AuthRouter(topicService, authService);
  app.use(mountPath, route.router());
}
