import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CodeSession } from './data-model';
import { environment } from '../../environments/environment';

@Injectable()
export class JoinSessionService {
  constructor(private http: HttpClient) { }

  join(sessionToken: string, userAlias: string): Observable<CodeSession> {
    return this.http.post<CodeSession>(`${environment.hipEditApiPrefix}/auth/join`, {
      sessionToken, userAlias
    });
  }

  verifyBearerToken(bearerToken: string, sessionToken: string): Observable<void> {
    return this.http.head<void>(`${environment.hipEditApiPrefix}/auth/verify`, {
      params: { bearerToken, sessionToken }
    });
  }
}
