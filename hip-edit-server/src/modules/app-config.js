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
  return process.env[configKey] || process.env[packageKey] || defStrValue;
}

const AppConfig: {
  logLevel: string,
  serverPort: number,
  editorTopicDomain?: ?string,
  messaging: TopicServiceConfigProperties
} = {
  logLevel: String(configValue('logger_console_level', 'debug')),

  serverPort: Number(configValue('server_port', 9000)),

  editorTopicDomain: configValue('editor_topic_domain'),

  messaging: {
    host: String(configValue('messaging_host', 'localhost')),
    port: Number(configValue('messaging_port', 61613)),
  },
};

if (configValue('messaging_user')) {
  AppConfig.messaging.auth = {
    user: String(configValue('messaging_user')),
    password: String(configValue('messaging_password')),
  };
}

export default AppConfig;
