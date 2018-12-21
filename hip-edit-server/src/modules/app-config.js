// @flow

import {TopicServiceConfigProperties} from './messaging/topic-service-config';

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
    local?: {enabled: boolean, db: {username: string, password: string}[]},
    google?: {
      enabled: boolean,
      clientID: string,
      clientSecret: string,
      callbackURL: string,
      appHost: string,
      prompt: string,
    }
  }
} = {
  logLevel: String(configValue('logger_console_level', 'debug')),

  serverPort: Number(configValue('server_port', 9000)),

  editorTopicDomain: configValue('messaging_editor_topic_domain'),

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
      appHost: String(configValue('auth_google_app_host')),
      prompt: 'consent select_account',
    },
  },
};

if (configValue('messaging_user')) {
  AppConfig.messaging.auth = {
    user: String(configValue('messaging_user')),
    password: String(configValue('messaging_password')),
  };
}

export default AppConfig;
