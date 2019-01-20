import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { EditorEvent } from './code-editor-event';
import { environment } from '../../environments/environment';
import { AppStateKey } from '../app-state-key';
import { AppStateService } from '../app-state.service';

@Injectable()
export class EditorEventService {
  constructor(private http: HttpClient,
              private appstate: AppStateService) { }

  postEvent(sessionToken: string, chars: string) : Observable<EditorEvent> {
    const postBody = {
      text: chars,
      eventType: 'text_change',
      sessionToken: sessionToken
    };

    let bearerToken: string = null;
    this.appstate.now(AppStateKey.BearerToken, {
      next: (value: string) => {
        bearerToken = value;
      }
    });
    return this.http.post<EditorEvent>(`${environment.hipEditApiPrefix}/api/events`,
                                       postBody, {
                                         headers: { 'Authorization': bearerToken }
                                       });
  }
}
