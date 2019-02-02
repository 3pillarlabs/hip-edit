import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { EditorEvent } from './code-editor-event';
import { environment } from '../../environments/environment';
import { State } from '../reducers';

@Injectable()
export class EditorEventService {
  constructor(private http: HttpClient, private store: Store<State>) {}

  postEvent(sessionToken: string, chars: string): Observable<EditorEvent> {
    const postBody = {
      text: chars,
      eventType: "text_change",
      sessionToken: sessionToken
    };

    return new Observable<EditorEvent>(observer => {
      this.store
        .select(state => state.session)
        .subscribe({
          next: (session) => {
            this.http
              .post<EditorEvent>(
                `${environment.hipEditApiPrefix}/api/events`,
                postBody,
                { headers: { Authorization: session.bearerToken } }
              )
              .subscribe({
                next: (value) => observer.next(value),
                error: (error) => observer.error(error)
              });
          }
        });
    });
  }
}
