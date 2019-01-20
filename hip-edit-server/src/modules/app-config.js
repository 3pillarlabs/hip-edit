// @flow

import type {TopicServiceConfigProperties, Credential} from './messaging/domain';
import {InsecureKey} from './insecure-key';
import type {LocalAuthConfig, GoogleAuthConfig, JwtConfig} from './auth/domain';

/**
 * Looks up config and package (in order) for a configuration parameter.
 * @param {string} name
 * @param {any} defaultValue
 * @return {string} value (or null)
 */
function configValue(name, defaultValue=undefined): ?string {
  let configKey = `npm_config_${name}`;
  let packageKey = `npm_package_config_${name}`;
  let defStrValue = defaultValue ? String(defaultValue) : undefined;
  let value = process.env[configKey] || process.env[packageKey] || defStrValue;
  if (value === 'false' || value === '\'false\'') {
    value = '';
  }
  return value;
}

const AppConfig: {
  logLevel: string,
  serverPort: number,
  editorTopicDomain?: ?string,
  messaging: TopicServiceConfigProperties,
  auth?: {
    local?: LocalAuthConfig,
    google?: GoogleAuthConfig,
    agent?: Credential,
    appHost?: string,
    jwt?: JwtConfig
  }
} = {
  logLevel: String(configValue('logger_console_level', 'debug')),

  serverPort: Number(configValue('server_port', 9000)),

  editorTopicDomain: configValue('messaging_editor_topic_domain', 'HipEdit.Editor'),

  messaging: {
    host: String(configValue('messaging_host', 'localhost')),
    port: Number(configValue('messaging_port', 61613)),
  },

  auth: {
    local: {
      enabled: Boolean(configValue('auth_local_enabled', false)),
      db: [
        {username: 'admin', password: 'password'},
        {username: 'publisher', password: 'quux'},
        {username: 'consumer', password: 'baz'},
      ],
    },
    google: {
      enabled: Boolean(configValue('auth_google_enabled', true)),
      clientID: String(configValue('auth_google_client_id')),
      clientSecret: String(configValue('auth_google_client_secret')),
      callbackURL: String(configValue('auth_google_callback_url')),
      prompt: 'consent select_account',
    },
    agent: {
      login: String(configValue('auth_agent_login', 'e2e_consumer')),
      passcode: String(configValue('auth_agent_passcode', 'password')),
    },
    appHost: String(configValue('auth_app_host')),
    jwt: {
      secretKey: String(configValue('auth_jwt_secret_key', InsecureKey)),
      expiresIn: Number(configValue('auth_jwt_expires_in', 3600)),
      issuer: String(configValue('auth_jwt_issuer', 'http://example.org')),
    },
  },
};

if (configValue('messaging_user')) {
  AppConfig.messaging.auth = {
    login: String(configValue('messaging_user')),
    passcode: String(configValue('messaging_password')),
  };
}

export {AppConfig};
