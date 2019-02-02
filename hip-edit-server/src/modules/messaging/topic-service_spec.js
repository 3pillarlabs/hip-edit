// @flow

import {subscribeError, Client} from 'stompit';
import {TopicService} from './topic-service';
import {TopicServiceConfig} from './domain';

describe(TopicService.name, () => {
  let stompClient: Client;
  let topicService: TopicService;
  let config = new TopicServiceConfig();

  beforeEach(() => {
    stompClient = jasmine.createSpyObj(subscribeError, ['connect']);
    topicService = new TopicService(stompClient, config);
  });

  describe('#postToTopic', () => {
    it('should call stomp#connect', () => {
      let promise = topicService.postToTopic('/xburant', 'e');
      expect(promise).toBeTruthy();
      expect(stompClient.connect).toHaveBeenCalled();
    });
  });

  describe('#delegate', () => {
    it('should write the data to client frame', () => {
      let resolve = jasmine.createSpy('resolve');
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, resolve, null);
      let frame = jasmine.createSpyObj('Frame', ['end']);
      let client = jasmine.createSpyObj('Client', ['send', 'disconnect']);
      client.send.and.returnValue(frame);
      client.disconnect.and.callFake((cb) => cb());
      onConnect(null, client);
      expect(resolve).toHaveBeenCalled();
    });
    it('should reject on connect error', () => {
      let reject = jasmine.createSpy('reject');
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, null, reject);
      onConnect({message: 'mock connect error'}, null);
      expect(reject).toHaveBeenCalled();
    });
    it('should reject on error after connection', () => {
      let reject = jasmine.createSpy('reject');
      let onConnect = topicService.delegate('/vim', 'over emacs', {}, null, reject);
      let frame = {
        end: () => {
          throw new Error('mock write error');
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
