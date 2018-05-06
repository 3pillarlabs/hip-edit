import EditorEventService from './service';
import TopicService from '../messaging/topic-service';

describe(EditorEventService, () => {
  let topicService = jasmine.createSpyObj(TopicService, ['postToTopic']);
  let editorEventService = new EditorEventService(topicService);

  describe('#queue', () => {
    it('should queue the event', () => {
      editorEventService.queue({
        sessionToken: '90c01e9a-9401-4953-a0c8-f5d434d76b4d',
        eventType: 'newText',
        text: 'class Foo',
      });
      expect(topicService.postToTopic).toHaveBeenCalled();
    });
  });
});
