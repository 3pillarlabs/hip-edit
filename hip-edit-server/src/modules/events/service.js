// @flow
import EditorEvent from './domain';
import TopicService from '../messaging/topic-service';
import logger from '../logging';
/**
 * Service for events
 */
export default class EditorEventService {
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
    return this.topicService.postToTopic(editorEvent.sessionToken, JSON.stringify(editorEvent));
  }
}
