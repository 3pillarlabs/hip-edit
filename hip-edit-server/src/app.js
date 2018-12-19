// @flow

// API Server
import express from 'express';
import morgan from 'morgan';
import {json, urlencoded} from 'body-parser';
import codeEventsRoute from './modules/events';
import authRoute from './modules/auth';

/**
 * Decorate with routes.
 * @param {express} app
 * @return {Object} decorated app.
 */
export function factory(app: express) {
  app.use(morgan('tiny'));
  app.use(urlencoded({extended: true}));
  app.use(json());
  authRoute(app);
  addRoutes(app);
  return app;
}

/**
 * Add new endpoints here.
 * @param {express} app Express App
 */
export function addRoutes(app: express) {
  codeEventsRoute(app);
}

export default factory(express());
