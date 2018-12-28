// @flow

import _ from 'lodash';
// eslint-disable-next-line no-unused-vars
import passport from 'passport';
import {OAuth2Strategy as GoogleOAuth2Strategy} from 'passport-google-oauth';
import logger from '../logging';

/**
 * Use Google OAuth2 strategy with passport
 *
 * @param {passport} passport module
 * @param {Object} config
 * @return {boolean} true if the strategy was applied, false otherwise
 */
export default function _googleOAuth2Strategy(passport: passport,
                                              config: {
                                                enabled: boolean,
                                                clientID: string,
                                                clientSecret: string,
                                                callbackURL: string,
                                                appHost: string,
                                                prompt: string,
                                              }) {
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
