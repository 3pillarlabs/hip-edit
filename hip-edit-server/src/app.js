// @flow

// API Server
import express from 'express';
import morgan from 'morgan';
import {json, urlencoded} from 'body-parser';
import {codeEventsRoute} from './modules/events';
import {authRoute} from './modules/auth';

/**
 * Decorate with routes.
 * @param {express} app
 * @return {Object} decorated app.
 */
function factory(app: express) {
  app.use(morgan('tiny'));
  app.use(urlencoded({extended: true}));
  app.use(json());
  authRoute(app, '/auth');
  addRoutes(app, '/api');
  return app;
}

/**
 * Add new endpoints here.
 * @param {express} app Express App
 * @param {string} mountPath
 */
function addRoutes(app: express, mountPath: string) {
  codeEventsRoute(app, `${mountPath}/events`);
}

const app = factory(express());

export {app, factory};
