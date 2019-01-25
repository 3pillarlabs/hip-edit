// @flow

import uuid from 'uuid';
import jwt from 'jsonwebtoken';

import {toError} from '../app-error';
import {logger} from '../logging';
import type {JwtConfig} from './domain';

/**
 * Authorization service
 */
export class AuthService {
  /**
   * Generates a session token
   *
   * @return {string}
   */
  generateSessionToken(): string {
    return uuid.v1();
  }

  /**
   * Fetch a Bearer token.
   *
   * @param {string} sessionToken
   * @param {JwtConfig} conf
   * @return {Promise<string>}
   */
  generateBearerToken(sessionToken: string, conf: JwtConfig): Promise<string> {
    const jwtOptions: jwt.SignOptions = {
      expiresIn: conf.expiresIn,
      issuer: `${conf.issuer}/auth-service`,
    };

    return new Promise((resolve, reject) => {
      jwt.sign({nonce: sessionToken}, conf.secretKey, jwtOptions, (err: Error | any | void, token: string) => {
        if (err) {
          logger.error(err);
          return reject(toError(err));
        }
        resolve(token);
      });
    });
  }

  /**
   * Verifies a Bearer token.
   *
   * @param {string} bearerToken
   * @param {Object} conf
   * @return {Promise}
   */
  verifyBearerToken(bearerToken: string, conf: JwtConfig): Promise<{[string]: any}> {
    return new Promise((resolve, reject) => {
      jwt.verify(bearerToken, conf.secretKey, {issuer: `${conf.issuer}/auth-service`},
        (err: ?Error, decoded: {[string]: any}) => {
          if (err) {
            logger.error(err);
            return reject(toError(err));
          }

          resolve(decoded);
        });
    });
  }
}
