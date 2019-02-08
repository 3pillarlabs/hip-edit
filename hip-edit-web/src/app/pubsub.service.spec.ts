import { TestBed, inject } from '@angular/core/testing';

import { PubsubService } from './pubsub.service';

describe('PubsubService', () => {
  let service: PubsubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PubsubService]
    });

    service = TestBed.get(PubsubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#editorEventsStream', () => {
    describe('#stompClient#connect OK', () => {
      it('should subscribe for messages', () => {
        service.stompClient = jasmine.createSpyObj('MockStompClient', ['subscribe'])
        service.stompClient.connect = (_headers, onConnectOk) => { onConnectOk() }
        service.editorEventsStream('c3po').subscribe();
        expect(service.stompClient.subscribe).toHaveBeenCalled();
      });
      describe('#onMessage', () => {
        it('should be emitted further', () => {
          service.stompClient = {
            connect: (_headers, onConnectOk) => { onConnectOk() },
            subscribe: (_destination, onMessage) => { onMessage({body: '{}'}) }
          };
          let observer = {
            next: jasmine.createSpy('next')
          };
          service.editorEventsStream('c3p0').subscribe(observer);
          expect(observer.next).toHaveBeenCalledWith({});
        });
        describe('#onMessage emit error', () => {
          it('should call observer#error', () => {
            service.stompClient = {
              connect: (_headers, onConnectOk) => { onConnectOk() },
              subscribe: (_destination, onMessage) => { onMessage({body: '{'}) },
              disconnect: jasmine.createSpy('stompClient#disconnect')
            };
            let observer = {
              error: jasmine.createSpy('error')
            };
            service.editorEventsStream('c3p0').subscribe(observer);
            expect(observer.error).toHaveBeenCalled();
          });
        })
      });
    });
    describe('#stompClient#connect FAIL', () => {
      it('should call observer#error', () => {
        service.stompClient = {
          connect: (_headers, _onConnectOk, onConnectErr) => { onConnectErr(new Error('Mock Connect Error')) },
          disconnect: jasmine.createSpy('stompClient#disconnect')
        };
        let observer = {
          error: jasmine.createSpy('error')
        };
        service.editorEventsStream('c3p0').subscribe(observer);
        expect(observer.error).toHaveBeenCalled();
      });
    });
  });
});
