import {Client} from 'stompit';
import TopicService from './topic-service';
import TopicServiceConfig from './topic-service-config';

describe(TopicService, () => {
  let stompClient = null;
  let topicService = null;
  let config = new TopicServiceConfig();

  beforeEach(() => {
    stompClient = jasmine.createSpyObj(Client, ['connect']);
    topicService = new TopicService(stompClient, config);
  });

  describe('#postToTopic', () => {
    it('should call stomp#connect', () => {
      topicService.postToTopic('/xburant', 'e');
      expect(stompClient.connect).toHaveBeenCalled();
    });
  });

  describe('#delegate.connect', () => {
    it('should write the data to client frame', () => {
      let resolve = jasmine.createSpy('resolve');
      let onConnect = topicService.delegate('/vim', 'over emacs', resolve, null);
      let frame = jasmine.createSpyObj('Frame', ['write', 'end']);
      let client = jasmine.createSpyObj('Client', {send: frame, disconnect: null});
      onConnect(null, client);
      expect(resolve).toHaveBeenCalled();
    });
    it('should throw on error', () => {
      let reject = jasmine.createSpy('reject');
      let onConnect = topicService.delegate('/vim', 'over emacs', null, reject);
      onConnect({message: 'mock error'}, null);
      expect(reject).toHaveBeenCalled();
    });
  });

  describe('#prefixTopic', () => {
    it('should prefix / if it does not exist', () => {
      expect(topicService.prefixTopic('foo')).toEqual('/topic/foo');
    });
    it('should not prefix / if it already exists', () => {
      expect(topicService.prefixTopic('/foo')).toEqual('/topic/foo');
    });
  });
});
