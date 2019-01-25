// @flow

import {EditorEventService} from './service';
import {TopicService} from '../messaging/topic-service';

describe(EditorEventService.name, () => {
  let topicService = jasmine.createSpyObj(TopicService, ['postToTopic']);
  let editorEventService = new EditorEventService(topicService);

  describe('#queue', () => {
    it('should queue the event', () => {
      topicService.postToTopic.and.callFake(() => new Promise((resolve, reject) => resolve()));
      let promise = editorEventService.queue({
        sessionToken: '90c01e9a-9401-4953-a0c8-f5d434d76b4d',
        eventType: 'newText',
        text: 'class Foo',
      });
      expect(promise).toBeTruthy();
      expect(topicService.postToTopic).toHaveBeenCalled();
    });
  });
});
