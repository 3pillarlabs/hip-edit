// @flow

export interface TopicServiceConfigProperties {
  host: string;
  port: number;
  auth?: ?{user: string, password: string}
}

/**
 * Configuration for TopicService
 */
export default class TopicServiceConfig {
  host: string;
  port: number;
  connectHeaders: {login: string, passcode: string};

  /**
   * Constructor
   * @param {Object} config;
   */
  constructor(config: TopicServiceConfigProperties = {host: 'localhost', port: 61613}) {
    this.host = config.host;
    this.port = config.port;
    if (config.auth) {
      this.connectHeaders = {
        login: config.auth.user,
        passcode: config.auth.password,
      };
    }
  }
}
