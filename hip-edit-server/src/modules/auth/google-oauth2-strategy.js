// @flow

import _ from 'lodash';
// eslint-disable-next-line no-unused-vars
import passport from 'passport';
import {OAuth2Strategy as GoogleOAuth2Strategy} from 'passport-google-oauth';
import {logger} from '../logging';
import type {GoogleAuthConfig} from './domain';

/**
 * Use Google OAuth2 strategy with passport
 *
 * @param {string} appHost application host URL
 * @param {GoogleAuthConfig} config
 * @return {boolean} true if the strategy was applied, false otherwise
 */
export function googleOAuth2Strategy(appHost: string, config: GoogleAuthConfig) {
  if (!config.enabled) {
    logger.debug('skipping google auth');
    return false;
  }

  passport.use(new GoogleOAuth2Strategy(_.pick(config, ['clientID', 'clientSecret', 'callbackURL', 'prompt']),
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    })
  );

  return true;
}
