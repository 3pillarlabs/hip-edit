import { Injectable } from '@angular/core';
import { PartialObserver } from 'rxjs/Observer';
import { AppStateKey } from './app-state-key';

@Injectable()
export class AppStateService {

 appState: {
    [key: string]: {
      value: any,
      observers: PartialObserver<any>[]
    }
  } = {};

  constructor() {
  }

  setValue(key: AppStateKey, value: any) {
    this.addKey(key);
    this.appState[key]['value'] = value;
    this.appState[key]['observers'].forEach(o => o.next(value));
  }

  subscribeKey(key: AppStateKey, observer: PartialObserver<any>) {
    this.addKey(key);
    this.appState[key]['observers'].push(observer);
    if (this.appState[key]['value']) {
      observer.next(this.appState[key]['value']);
    }
  }

  private addKey(key: string) {
    if (!this.appState[key]) {
      this.appState[key] = {
        value: undefined,
        observers: []
      };
    }
  }
}
