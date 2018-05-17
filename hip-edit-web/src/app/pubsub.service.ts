import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { client as stompClientFactory } from '@stomp/stompjs';

import { EditorEvent } from './code-editor/code-editor-event';
import { StompConnectOptions } from './stomp-connect-options';
import { environment } from '../environments/environment';

@Injectable()
export class PubsubService {
  private defaultOptions = {
    stomp: {
      server: {
      	host: 'localhost',
      	port: 61614,
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
    return new Observable<EditorEvent>((observer) => {
      this.stompClient.connect({}, this.onStompConnectOk(observer, sessionToken),
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

  onStompConnectOk(observer: Observer<EditorEvent>, sessionToken: string): Function {
    return () => {
      const destination = `/topic/${sessionToken}`;
      this.stompClient.subscribe(destination, this.onMessage(observer));
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
    let _ref = this.stompClient;
    return {
      unsubscribe() {
        _ref.disconnect();
      }
    }
  }
}
