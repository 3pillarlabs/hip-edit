import { Injectable } from '@angular/core';
import { Observable ,  Observer } from 'rxjs';
import { client as stompClientFactory } from '@stomp/stompjs';

import { EditorEvent } from './code-editor/code-editor-event';
import { StompConnectOptions } from './stomp-connect-options';
import { environment } from '../environments/environment';

@Injectable()
export class PubsubService {
  private defaultOptions: {
    stomp: {server: StompConnectOptions}
  } = {
    stomp: {
      server: {
      	host: 'localhost',
        port: 61614,
        headers: null,
      }
    }
  };

  private connectOptions: StompConnectOptions = null;
  private wsUrl: string = null;
  private _stompClient;

  constructor() {
    this.connectOptions = {...this.defaultOptions.stomp.server, ...environment.stomp.server};
    this.wsUrl = `ws://${this.connectOptions.host}:${this.connectOptions.port}/`
  }

  get stompClient() {
    if (!this._stompClient) this._stompClient = stompClientFactory(this.wsUrl);
    return this._stompClient;
  }

  set stompClient(newStompClient) {
    this._stompClient = newStompClient;
  }

  editorEventsStream(sessionToken: string): Observable<EditorEvent> {
    let destination: string = undefined;
    if (this.connectOptions.domain) {
      destination = `${this.connectOptions.domain}.${sessionToken}`;
    } else {
      destination = sessionToken;
    }

    return new Observable<EditorEvent>((observer) => {
      let headers = this.connectOptions.headers || {};
      this.stompClient.connect(headers, this.onStompConnectOk(observer, destination),
                               this.onStompConnectError(observer));
      return this.unsubscribeHandler();
    });
  }

  onStompConnectError(observer: Observer<EditorEvent>): Function {
    return (error) => {
      console.error(`Error connecting to STOMP server: ${error}`);
      observer.error(error);
    }
  }

  onStompConnectOk(observer: Observer<EditorEvent>, destination: string): Function {
    return () => {
      const topic = `/topic/${destination}`;
      this.stompClient.subscribe(topic, this.onMessage(observer), {
        'activemq.retroactive': true
      });
    }
  }

  onMessage(observer: Observer<EditorEvent>): Function {
    return (message) => {
      this.emitMessage(observer, message.body);
    }
  }

  emitMessage(observer: Observer<EditorEvent>, body: any) {
    try {
      observer.next(JSON.parse(body));
    } catch (error) {
      console.error(`Error emitting values to subscriber: ${error}`);
      observer.error(error);
    }
  }

  unsubscribeHandler() {
    let disconnectFn: Function = this.stompClient.disconnect;
    return {
      unsubscribe() {
        disconnectFn();
      }
    }
  }
}
