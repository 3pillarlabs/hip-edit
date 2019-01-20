// @flow

import stomp from 'stompit';
import type {TopicServiceConfigProperties} from './domain';
import {TopicServiceConfig} from './domain';
import {TopicService} from './topic-service';

/**
 * Factory function for TopicService
 * @param {TopicServiceConfigProperties} config
 * @return {TopicService}
 */
export function topicServiceFactory(config: ?TopicServiceConfigProperties = undefined) {
  return new TopicService(stomp, new TopicServiceConfig(config));
}
