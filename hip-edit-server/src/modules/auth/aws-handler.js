// @flow

import _ from 'lodash';

import {AuthService} from './auth-service';
import {AppConfig} from '../app-config';
import type {JwtConfig} from './domain';

const confKeys = ['secretKey', 'issuer'];

type EventOptions = {
  authorizationToken: string,
  methodArn: string,
  [string]: any
}

/**
 * Creates and returns a Handler function.
 * @param {AuthService} serviceRef
 * @param {JwtConfig} conf
 * @return {Function}
 */
export function createHandler(serviceRef: ?AuthService,
                              conf: ?JwtConfig): (
                                event: EventOptions,
                                context: {[string]: any},
                                callback: Function) => Promise<void> {
  const config = conf || (AppConfig.auth && AppConfig.auth.jwt ? _.pick(AppConfig.auth.jwt, confKeys) : undefined);
  if (!config) {
    throw new Error('Invalid configuration - missing AppConfig.auth.jwt');
  }

  const service = serviceRef || new AuthService();

  return (event: EventOptions, context: {[string]: any}, callback: Function): Promise<void> => {
      return service.verifyBearerToken(event.authorizationToken, config)
        .then((decoded: {[string]: any}) => {
          callback(null, {
            principalId: 'user',
            policyDocument: {
              Version: '2012-10-17',
              Statement: [{
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: event.methodArn,
              }],
            },
          });
        })
        .catch((error: Error) => {
          callback('Unauthorized');
        });
  };
}
