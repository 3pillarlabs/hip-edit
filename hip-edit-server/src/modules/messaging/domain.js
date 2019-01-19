// @flow
export type Credential = {
  login: string,
  passcode: string
}

export type TopicServiceConfigProperties = {
  host: string,
  port: number,
  auth?: ?Credential
}

/**
 * Configuration for TopicService
 */
export class TopicServiceConfig {
  host: string;
  port: number;
  connectHeaders: Credential;

  /**
   * Constructor
   * @param {Object} config;
   */
  constructor(config: ?TopicServiceConfigProperties = undefined) {
    this.host = config ? config.host : 'localhost';
    this.port = config ? config.port : 61613;
    if (config && config.auth) {
      this.connectHeaders = {
        login: config.auth.login,
        passcode: config.auth.passcode,
      };
    }
  }
}
