// @flow

import _ from 'lodash';
import {Client} from 'stompit';
import logger from '../logging';
import TopicServiceConfig from './topic-service-config';
import {toError} from '../app-error';

type MessageOptions = {
  expires?: number,
  persistent?: boolean
}

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
   * @param {MessageOptions | void} messageOptions
   * @return {Promise}
   */
  postToTopic(topic: string, doc: string, messageOptions: MessageOptions | void): Promise<void> {
    const prefixedTopic = this.prefixTopic(topic);
    return new Promise((resolve, reject) => {
      this.stompClient.connect(this.config, this.delegate(prefixedTopic, doc, messageOptions, resolve, reject));
    });
  }

  /**
   * Connect callback generator
   * @param {string} topic
   * @param {string} doc
   * @param {MessageOptions | void} messageOptions
   * @param {Function} resolve
   * @param {Function} reject
  * @return {Function}
   */
   delegate(topic: string, doc: string, messageOptions: MessageOptions | void,
            resolve: Function, reject: Function): Function {
     return (error: Error | any, client: Client) => {
       if (error) {
         logger.error(error);
         reject(toError(error));
         return;
       }
       try {
         const frame = client.send(_.assign({destination: topic, persistent: true}, messageOptions));
         frame.end(doc);
         client.disconnect(resolve);
       } catch (e) {
         logger.error(e);
         reject(toError(e));
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

  /**
   * Creates a topic.
   *
   * @param {string} topic
   * @return {Promise<void>}
   */
  createTopic(topic: string): Promise<void> {
    return this.postToTopic(topic, '#', {
      persistent: false,
      expires: 1,
    });
  }

  /**
   * Trt to subscribe to a topic
   *
   * @param {string} topic
   * @param {Object} connectHeaders
   * @return {Promise}
   */
  trySubscribeTopic(topic: string,
                    connectHeaders: {login: string,
                                     passcode: string} | void = undefined): Promise<void> {
    const prefixedTopic = this.prefixTopic(topic);
    const connectConfig = _.assign({}, this.config, {connectHeaders});
    return new Promise((resolve, reject) => {
      this.stompClient
        .connect(connectConfig, (connectError: any, client: Client) => {
          if (connectError) {
            reject(toError(connectError));
            return;
          }
          client
            .sendFrame('SUBSCRIBE', {
              destination: prefixedTopic,
              id: topic,
              ack: 'auto',
            }, {
              onError: (error) => {
                client.disconnect();
                client.destroy();
                reject(toError(error));
              },
              onReceipt: () => {
                client.disconnect();
                client.destroy();
                resolve();
              },
            })
            .end();
        });
    });
  }
}
