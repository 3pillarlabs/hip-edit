// @flow

import express from 'express';
import AuthRouter from './router';

/**
 * Mounts Express app
 * @param {express} app
 */
export default function _authRoute(app: express) {
  const route = new AuthRouter();
  app.use('/auth', route.router());
}
