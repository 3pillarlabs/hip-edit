// @flow

// eslint-disable-next-line no-unused-vars
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {logger} from '../logging';
import type {LocalAuthConfig} from './domain';

/**
 * @param {passport} passport Passport module
 * @param {Object} config
 * @return {boolean} true if local strategy was applied
 */
export function localAuthStrategy(passport: passport, config: LocalAuthConfig): boolean {
  if (!config.enabled) {
    logger.debug('skipping local auth');
    return false;
  }

  passport.use(new LocalStrategy({
    usernameField: 'userName',
    session: false,
  }, (username, password, done) => {
    const user = config.db.find((valid) => valid.username === username && valid.password === password);
    return done(null, user ? user.username : false);
  }));

  return true;
}
