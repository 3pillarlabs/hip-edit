// @flow

// eslint-disable-next-line no-unused-vars
import passport from 'passport';
import {OAuth2Strategy as GoogleOAuth2Strategy} from 'passport-google-oauth';
import AppConfig from '../app-config';
import logger from '../logging';

/**
 * Use Google OAuth2 strategy with passport
 *
 * @param {passport} passport module
 * @return {boolean} true if the strategy was applied, false otherwise
 */
export default function _googleOAuth2Strategy(passport: passport) {
  if (! (AppConfig.auth && AppConfig.auth.google && AppConfig.auth.google.enabled) ) {
    logger.debug('skipping google auth');
    return false;
  }

  passport.use(new GoogleOAuth2Strategy({
    clientID: AppConfig.auth.google.clientID,
    clientSecret: AppConfig.auth.google.clientSecret,
    callbackURL: AppConfig.auth.google.callbackURL,
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));

  return true;
}
