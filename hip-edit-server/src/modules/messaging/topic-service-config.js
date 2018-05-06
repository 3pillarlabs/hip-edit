// @flow
/**
 * Configuration for TopicService
 */
export default class TopicServiceConfig {
  host: string;
  port: number;

  /**
   * Constructor
   * @param {Object} config;
   */
  constructor(config: Object = {}) {
    this.host = config.host || 'localhost';
    this.port = config.port || 61613;
  }
}
