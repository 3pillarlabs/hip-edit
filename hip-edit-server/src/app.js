// API Server
import express from 'express';
import morgan from 'morgan';
import {json} from 'body-parser';
import codeEventsRoute from './modules/events/route';

/**
 * Decorate with routes.
 * @param {Object} app
 * @return {Object} decorated app.
 */
export function factory(app) {
  app.use(morgan('tiny'));
  app.use(json());
  addRoutes(app);
  return app;
}

/**
 * Add new endpoints here.
 * @param {Object} app Express App
 */
export function addRoutes(app) {
  codeEventsRoute(app);
}

export default factory(express());
