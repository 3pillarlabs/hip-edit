import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { CodeSession } from './code-session';
import { environment } from '../../environments/environment';

@Injectable()
export class JoinSessionService {
  constructor(private http: HttpClient) { }

  join(sessionToken: string, userAlias: string) : Observable<CodeSession> {
    return this.http.post<CodeSession>(`${environment.hipEditApiPrefix}/auth/join`, {
      sessionToken, userAlias
    });
  }
}
