// @flow

import express from 'express';
import {urlencoded} from 'body-parser';
import uuid from 'uuid';
import passport from 'passport';
import localAuthStrategy from './local-auth-strategy';
import googleOAuth2Strategy from './google-oauth2-strategy';
import AppConfig from '../app-config';
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
    this.addGoogleAuthStrategy(router);
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
   * Add Google Auth Strategy
   * @param {express.Router} router
   */
  addGoogleAuthStrategy(router: express.Router) {
    if (! googleOAuth2Strategy(passport)) return;

    router.get('/google',
      passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']})
    );

    router.get('/google/callback',
      passport.authenticate('google', {session: false, failureRedirect: '/'}),
      (req, res) => {
        logger.debug(req.user);
        let host: string | void = undefined;
        if (AppConfig.auth && AppConfig.auth.google) {
          host = AppConfig.auth.google.appHost;
        }
        this.setActiveSession(res, host);
      }
    );

    logger.info('Added google auth strategy');
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
