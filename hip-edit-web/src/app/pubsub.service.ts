import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { EditorEvent } from './code-editor/code-editor-event';
import { environment } from '../environments/environment';

@Injectable()
export class PubsubService {

  constructor(private http: HttpClient) { }

  postEvent(chars : string) : Observable<EditorEvent> {
    let e = {
      text: chars,
      eventType: 'text_change',
      sessionToken: 'eb6e7dc8-9fe3-4bec-b211-661af5e9209c'
    };
    return this.http.post<EditorEvent>(`${environment.hipEditApiPrefix}/events`, e);
  }
}
