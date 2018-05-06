// @flow
import {Client} from 'stompit';
import logger from '../logging';
import TopicServiceConfig from './topic-service-config';

/**
 * Adapter to a STOMP aware endpoint for sending and receiving messages to/from a TOPIC.
 */
export default class TopicService {
  stompClient: Client;
  config: TopicServiceConfig;
  topicPrefixRegex: RegExp;

  /**
   * constructor
   * @param {stompit.Client} stompClient
   * @param {TopicServiceConfig} config
   */
  constructor(stompClient: Client, config: TopicServiceConfig) {
    this.stompClient = stompClient;
    this.config = config;
    this.topicPrefixRegex = new RegExp('^/');
  }

  /**
   * Post data to topic.
   * @param {string} topic
   * @param {string} doc
   * @return {Promise}
   */
  postToTopic(topic: string, doc: string): Promise<void> {
    const prefixedTopic = this.prefixTopic(topic);
    return new Promise((resolve, reject) => {
      this.stompClient.connect(this.config, this.delegate(prefixedTopic, doc, resolve, reject));
    });
  }

  /**
   * Connect callback generator
   * @param {string} topic
   * @param {string} doc
   * @param {Function} resolve
   * @param {Function} reject
   * @return {Function}
   */
   delegate(topic: string, doc: string, resolve: Function, reject: Function): Function {
     return (error: Object, client: Object) => {
       if (error) {
         logger.error(error);
         reject(error);
         return;
       }
       try {
         const frame = client.send({destination: topic});
         frame.end(doc);
         client.disconnect(resolve);
       } catch (e) {
         logger.error(e);
         reject(e);
       }
     };
   }

  /**
   * Prefix topic with '/' if needed.
   * @param {string} topic
   * @return {string}
   */
  prefixTopic(topic: string): string {
    if (this.topicPrefixRegex.exec(topic)) return `/topic${topic}`;
    return `/topic/${topic}`;
  }
}
