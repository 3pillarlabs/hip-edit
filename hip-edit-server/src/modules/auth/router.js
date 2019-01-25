// @flow

import express from 'express';
import {urlencoded, json} from 'body-parser';
import passport from 'passport';
import {localAuthStrategy} from './local-auth-strategy';
import {googleOAuth2Strategy} from './google-oauth2-strategy';
import {AppConfig} from '../app-config';
import {logger} from '../logging';
import {TopicService} from '../messaging/topic-service';
import {toObject} from '../app-error';
import {AuthService} from './auth-service';
import type {LocalAuthConfig, GoogleAuthConfig, JwtConfig} from './domain';

/**
 * Auth router
 */
export class AuthRouter {
  topicService: TopicService;
  authService: AuthService;

  _localAuthConfig: LocalAuthConfig;
  _googleAuthConfig: GoogleAuthConfig;
  _appHost: string;
  _jwtConfig: JwtConfig;

  /**
   * @param {TopicService} topicService
   * @param {AuthService} authService
   * Constructor
   */
  constructor(topicService: TopicService, authService: AuthService) {
    this.topicService = topicService;
    this.authService = authService;

    if (AppConfig.auth && AppConfig.auth.local) {
      this.localAuthConfig = AppConfig.auth.local;
    }

    if (AppConfig.auth && AppConfig.auth.google) {
      this.googleAuthConfig = AppConfig.auth.google;
    }

    if (AppConfig.auth && AppConfig.auth.appHost) {
      this.appHost= AppConfig.auth.appHost;
    }

    if (AppConfig.auth && AppConfig.auth.jwt) {
      this._jwtConfig = AppConfig.auth.jwt;
    }
  }

  /**
   * @return {LocalAuthConfig}
   */
  get localAuthConfig(): LocalAuthConfig {
    return this._localAuthConfig;
  }

  /**
   * @param {LocalAuthConfig} newLocalAuthConfig
   */
  set localAuthConfig(newLocalAuthConfig: LocalAuthConfig) {
    this._localAuthConfig = newLocalAuthConfig;
  }

  /**
   * @return {GoogleAuthConfig}
   */
  get googleAuthConfig(): GoogleAuthConfig {
    return this._googleAuthConfig;
  }

  /**
   * @param {GoogleAuthConfig} newGoogleAuthConfig
   */
  set googleAuthConfig(newGoogleAuthConfig: GoogleAuthConfig) {
    this._googleAuthConfig = newGoogleAuthConfig;
  }

  /**
   * @return {string}
   */
  get appHost(): string {
    return this._appHost;
  }

  /**
   * @param {string} newAppHost
   */
  set appHost(newAppHost: string) {
    this._appHost = newAppHost;
  }

  /**
   * @return {JwtConfig}
   */
  get jwtConfig(): JwtConfig {
    return this._jwtConfig;
  }

  /**
   * @param {JwtConfig} newJwtConfig
   */
  set jwtConfig(newJwtConfig: JwtConfig) {
    this._jwtConfig = newJwtConfig;
  }

  /**
   * @return {express.Router} router
   */
  router(): express.Router {
    const router = express.Router();
    router.use(passport.initialize());
    this.addLocalStrategy(router);
    this.addGoogleAuthStrategy(router);
    this.addJoinRoute(router);
    this.addVerifyRoute(router);
    return router;
  }

  /**
   * Add passport local auth
   * @param {express.Router} router
   */
  addLocalStrategy(router: express.Router) {
    if (!localAuthStrategy(this.localAuthConfig)) return;
    logger.info('Added login auth strategy');

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
  }

  /**
   * Add Google Auth Strategy
   * @param {express.Router} router
   */
  addGoogleAuthStrategy(router: express.Router) {
    if (! googleOAuth2Strategy(this.appHost, this.googleAuthConfig)) return;
    logger.info('Added google auth strategy');

    router.get('/google',
      passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']})
    );

    router.get('/google/callback',
      passport.authenticate('google', {session: false, failureRedirect: '/'}),
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
    const sessionId = this.authService.generateSessionToken();
    let topic = this.toTopic(sessionId);
    this.topicService.createTopic(topic)
      .then(() => {
        return this.authService.generateBearerToken(sessionId, this.jwtConfig);
      })
      .then((bearerToken) => {
        let path: string = this.appHost ? `${this.appHost}/` : '/';
        path += `?sessionToken=${sessionId}&bearerToken=${bearerToken}`;
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
            return this.authService.generateBearerToken(sessionId, this.jwtConfig);
          })
          .then((bearerToken) => {
            res.status(200).json({bearerToken}).end();
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

  /**
   * /verify
   * @param {express.Router} router
   */
  addVerifyRoute(router: express.Router) {
    router.head('/verify', (req, res) => {
      this.authService.verifyBearerToken(req.query.bearerToken, this.jwtConfig)
        .then((decoded) => {
          if (decoded.nonce === req.query.sessionToken) {
            res.status(200).end();
          } else {
            res.status(401).json({message: 'Invalid payload'}).end();
          }
        })
        .catch((error: Error) => res.status(401).json({message: error.message}).end());
    });
  }
}
