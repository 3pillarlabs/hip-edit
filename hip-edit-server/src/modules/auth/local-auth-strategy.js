// @flow

// eslint-disable-next-line no-unused-vars
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import AppConfig from '../app-config';
import logger from '../logging';

/**
 * @param {passport} passport Passport module
 * @return {boolean} true if local strategy was applied
 */
export default function _localAuthStrategy(passport: passport): boolean {
  if (! (AppConfig.auth && AppConfig.auth.local && AppConfig.auth.local.enabled) ) {
    logger.debug('skipping local auth');
    return false;
  }

  const local = AppConfig.auth.local;
  passport.use(new LocalStrategy({
    usernameField: 'userName',
    session: false,
  }, (username, password, done) => {
    const user = local.db.find((valid) => valid.username === username && valid.password === password);
    return done(null, user ? user.username : false);
  }));

  return true;
}
