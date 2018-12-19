// @flow

import express from 'express';
import {urlencoded} from 'body-parser';
import uuid from 'uuid';
import passport from 'passport';
import localAuthStrategy from './local-auth-strategy';
import logger from '../logging';

/**
 * Auth router
 */
export default class AuthRouter {
  /**
   * @return {express.Router} router
   */
  router(): express.Router {
    const router = express.Router();
    router.use(passport.initialize());
    this.addLocalStrategy(router);
    return router;
  }

  /**
   * Add passport local auth
   * @param {express.Router} router
   */
  addLocalStrategy(router: express.Router) {
    if (! localAuthStrategy(passport)) return;

    router.post('/login', urlencoded({extended: true}), (req, res, next) => {
      passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          res.status(401).end();
          return;
        }
        this.setActiveSession(res);
      })(req, res, next);
    });

    logger.info('Added login auth strategy');
  }

  /**
   * Sets the sessionToken.
   * @param {express.Response} res
   * @param {String} host
   */
  setActiveSession(res: express.Response, host: string | void = undefined) {
    const sessionId = uuid.v1();
    const path = host ? `${host}/(editors:session/${sessionId})` : `/(editors:session/${sessionId})`;
    res.location(path).status(302).end();
  }
}
