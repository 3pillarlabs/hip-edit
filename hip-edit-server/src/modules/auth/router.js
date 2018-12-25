// @flow

import express from 'express';
import {urlencoded, json} from 'body-parser';
import uuid from 'uuid';
import passport from 'passport';
import localAuthStrategy from './local-auth-strategy';
import googleOAuth2Strategy from './google-oauth2-strategy';
import AppConfig from '../app-config';
import logger from '../logging';
import TopicService from '../messaging/topic-service';
import {toObject} from '../app-error';

/**
 * Auth router
 */
export default class AuthRouter {
  topicService: TopicService;
  localAuthConfig: Object;
  googleAuthConfig: Object;
  appHost: ?string;
  _passportRef: passport;

  /**
   * @param {TopicService} topicService
   * @param {Object} localAuthConfig
   * @param {Object} googleAuthConfig
   * @param {string} appHost
   * Constructor
   */
  constructor(topicService: TopicService,
              localAuthConfig: ?Object,
              googleAuthConfig: ?Object,
              appHost: ?string) {
    this.topicService = topicService;

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

    this.appHost = appHost;
    if (!this.appHost && AppConfig.auth) {
      this.appHost= AppConfig.auth.appHost;
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
    this.addJoinRoute(router);
    return router;
  }

  /**
   * Add passport local auth
   * @param {express.Router} router
   */
  addLocalStrategy(router: express.Router) {
    if (!localAuthStrategy(this._passportRef, this.localAuthConfig)) return;
    logger.info('Added login auth strategy');

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
  }

  /**
   * Add Google Auth Strategy
   * @param {express.Router} router
   */
  addGoogleAuthStrategy(router: express.Router) {
    if (! googleOAuth2Strategy(this._passportRef, this.googleAuthConfig)) return;
    logger.info('Added google auth strategy');

    router.get('/google',
      this._passportRef.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']})
    );

    router.get('/google/callback',
      this._passportRef.authenticate('google', {session: false, failureRedirect: '/'}),
      (req, res) => {
        logger.debug(req.user);
        this.setActiveSession(res);
      }
    );
  }

  /**
   * Sets the sessionToken.
   * @param {express.Response} res
   */
  setActiveSession(res: express.Response) {
    const sessionId = uuid.v1();
    let topic = this.toTopic(sessionId);
    this.topicService.createTopic(topic)
      .then(() => {
        const path = this.appHost ? `${this.appHost}/(editors:session/${sessionId})` :
                                    `/(editors:session/${sessionId})`;
        res.location(path).status(302).json({}).end();
        logger.debug(`set sessionToken to ${sessionId}`);
      })
      .catch((error) => {
        logger.error(error);
        res.status(500).json(toObject(error));
      });
  }

  /**
   * Creates a topic from a session
   * @param {string} sessionId
   * @return {string}
   */
  toTopic(sessionId: string): string {
    let topic: ?string = undefined;
    if (AppConfig.editorTopicDomain) {
      topic = `${AppConfig.editorTopicDomain}.${sessionId}`;
    } else {
      topic = sessionId;
    }
    logger.debug(`topic: ${topic}`);
    return topic;
  }

   /**
   * Add /join route
   * @param {express.Router} router
   */
  addJoinRoute(router: express.Router) {
    router.post('/join', json(), (req, res) => {
      const sessionId = req.body.sessionToken;
      const topic = this.toTopic(sessionId);
      const connectHeaders = AppConfig.auth ? AppConfig.auth.agent : undefined;
      try {
        this.topicService
          .trySubscribeTopic(topic, connectHeaders)
          .then(() => {
            res.status(200).json({}).end();
          })
          .catch((error) => {
            logger.error(error);
            res.status(401).json(toObject(error)).end();
          });
      } catch (error) {
        logger.error(error);
        res.status(401).json(toObject(error)).end();
      }
    });
  }
}
