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
  localAuthConfig: Object;
  googleAuthConfig: Object;
  _passportRef: passport;

  /**
   * @param {Object} localAuthConfig
   * @param {Object} googleAuthConfig
   * Constructor
   */
  constructor(localAuthConfig: ?Object, googleAuthConfig: ?Object) {
    if (localAuthConfig) {
      this.localAuthConfig = localAuthConfig;
    } else if (AppConfig.auth && AppConfig.auth.local) {
      this.localAuthConfig = AppConfig.auth.local;
    }

    if (googleAuthConfig) {
      this.googleAuthConfig = googleAuthConfig;
    } else if (AppConfig.auth && AppConfig.auth.google) {
      this.googleAuthConfig = AppConfig.auth.google;
    }

    this._passportRef = passport;
  }

  /**
   * @param {passport} newPassportRef
   */
  set passportRef(newPassportRef: passport | void) {
    this._passportRef = newPassportRef;
    logger.debug(`set new passport ref: ${this._passportRef || 'undefined'}`);
  }

  /**
   * @return {passport}
   */
  get passportRef(): passport {
    return this._passportRef;
  }

  /**
   * @return {express.Router} router
   */
  router(): express.Router {
    const router = express.Router();
    router.use(this._passportRef.initialize());
    this.addLocalStrategy(router);
    this.addGoogleAuthStrategy(router);
    return router;
  }

  /**
   * Add passport local auth
   * @param {express.Router} router
   */
  addLocalStrategy(router: express.Router) {
    if (!localAuthStrategy(this._passportRef, this.localAuthConfig)) return;

    router.post('/login', urlencoded({extended: true}), (req, res, next) => {
      this._passportRef.authenticate('local', {session: false}, (err, user, info) => {
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
    if (! googleOAuth2Strategy(this._passportRef, this.googleAuthConfig)) return;

    router.get('/google',
      this._passportRef.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']})
    );

    router.get('/google/callback',
      this._passportRef.authenticate('google', {session: false, failureRedirect: '/'}),
      (req, res) => {
        logger.debug(req.user);
        this.setActiveSession(res, this.googleAuthConfig.appHost);
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
