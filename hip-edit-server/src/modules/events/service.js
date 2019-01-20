// @flow
import type {EditorEvent} from './domain';
import {TopicService} from '../messaging/topic-service';
import {logger} from '../logging';
import {AppConfig} from '../app-config';

/**
 * Service for events
 */
export class EditorEventService {
  topicService: TopicService;

  /**
   * constructor
   * @param {TopicService} topicService
   */
  constructor(topicService: TopicService) {
    this.topicService = topicService;
  }

  /**
   * Push events to queue
   * @param {EditorEvent} editorEvent
   * @return {Promise}
   */
  queue(editorEvent: EditorEvent): Promise<void> {
    logger.debug(editorEvent);
    let topic: ?string = undefined;
    if (AppConfig.editorTopicDomain) {
      topic = `${AppConfig.editorTopicDomain}.${editorEvent.sessionToken}`;
    } else {
      topic = editorEvent.sessionToken;
    }
    logger.debug(`Queuing event to [${topic}]...`);

    return this.topicService.postToTopic(topic, JSON.stringify(editorEvent));
  }
}
