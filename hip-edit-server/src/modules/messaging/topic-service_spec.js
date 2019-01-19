import {subscribeError} from 'stompit';
import {TopicService} from './topic-service';
import {TopicServiceConfig} from './domain';

describe(TopicService.name, () => {
  let stompClient = null;
  let topicService = null;
  let config = new TopicServiceConfig();

  beforeEach(() => {
    stompClient = jasmine.createSpyObj(subscribeError, ['connect']);
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
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, resolve, null);
      let frame = jasmine.createSpyObj('Frame', ['end']);
      let client = jasmine.createSpyObj('Client', {send: frame});
      client.disconnect = (r) => {
        r();
      };
      onConnect(null, client);
      expect(resolve).toHaveBeenCalled();
    });
    it('should reject on connect error', () => {
      let reject = jasmine.createSpy('reject');
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, null, reject);
      onConnect({message: 'connect error'}, null);
      expect(reject).toHaveBeenCalled();
    });
    it('should reject on error after connection', () => {
      let reject = jasmine.createSpy('reject');
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, null, reject);
      let frame = {
        write: () => {
          throw new Error('write error');
        },

        on: () => {},
      };
      let client = jasmine.createSpyObj('Client', {send: frame});
      onConnect(null, client);
      expect(reject).toHaveBeenCalled();
    });
    it('should reject on write error', () => {
      let reject = jasmine.createSpy('reject');
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, null, reject);
      let eventHandlers = [];
      let frame = {

        write: () => {
          eventHandlers[0]['error'](new Error('write error'));
        },

        on: (eventName, fn) => {
          eventHandlers.push({'error': fn});
        },
      };
      let client = jasmine.createSpyObj('Client', {send: frame});
      onConnect(null, client);
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

  describe('#createTopic', () => {
    it('should call postToTopic', () => {
      const spy = spyOn(TopicService.prototype, 'postToTopic').and.stub();
      topicService.createTopic('foo');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#trySubscribeTopic', () => {
    it('should reject the promise if connect fails', (done) => {
      stompClient.connect.and.callFake((_conf, cb) => cb({message: 'fake connect fail'}, null));
      topicService.trySubscribeTopic('#topic', {login: 'login', passcode: 'password'})
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });
    it('should reject the promise if subscribe fails', (done) => {
      const client = jasmine.createSpyObj('stomp.Client', ['sendFrame', 'disconnect', 'destroy']);
      client.sendFrame.and.callFake((_command, _headers, options) => options.onError('UnAuthorized'));
      stompClient.connect.and.callFake((_conf, cb) => cb(null, client));
      topicService.trySubscribeTopic('#topic', {login: 'login', passcode: 'passw0rd'})
        .catch((error) => {
          expect(error).toBeTruthy();
          done();
        });
    });
    it('should resolve the promise if subscribe succeeds', (done) => {
      const client = jasmine.createSpyObj('stomp.Client', ['sendFrame', 'disconnect', 'destroy']);
      client.sendFrame.and.callFake((_command, _headers, options) => options.onReceipt());
      stompClient.connect.and.callFake((_conf, cb) => cb(null, client));
      topicService.trySubscribeTopic('#topic', {login: 'login', passcode: 'password'})
        .then(done)
        .catch((error) => fail(error));
    });
  });
});
