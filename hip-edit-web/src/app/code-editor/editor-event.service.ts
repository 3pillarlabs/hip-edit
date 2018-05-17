import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { EditorEvent } from './code-editor-event';
import { environment } from '../../environments/environment';

@Injectable()
export class EditorEventService {
  constructor(private http: HttpClient) { }


  postEvent(sessionToken: string, chars: string) : Observable<EditorEvent> {
    let e = {
      text: chars,
      eventType: 'text_change',
      sessionToken: sessionToken
    };

    return this.http.post<EditorEvent>(`${environment.hipEditApiPrefix}/events`, e);
  }
}
