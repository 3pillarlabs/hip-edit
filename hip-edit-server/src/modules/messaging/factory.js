import stomp from 'stompit';
import TopicServiceConfig from './topic-service-config';
import TopicService from './topic-service';

/**
 * Factory function for TopicService
 * @param {TopicServiceConfig} config
 * @return {TopicService}
 */
export default function _topicServiceFactory(config = null) {
  return new TopicService(stomp, new TopicServiceConfig(config));
}
