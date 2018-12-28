// @flow

// eslint-disable-next-line no-unused-vars
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import logger from '../logging';

/**
 * @param {passport} passport Passport module
 * @param {Object} config
 * @return {boolean} true if local strategy was applied
 */
export default function _localAuthStrategy(passport: passport,
                                           config: {
                                             enabled: boolean,
                                             db: {username: string, password: string}[],
                                          }): boolean {
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
