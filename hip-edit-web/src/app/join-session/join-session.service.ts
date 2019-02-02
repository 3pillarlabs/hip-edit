import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { LoginAction } from '../actions/login.actions';
import { State } from '../reducers';

import { CodeSession } from './data-model';
import { environment } from '../../environments/environment';

@Injectable()
export class JoinSessionService {
  constructor(private http: HttpClient,
              private store: Store<State>) { }

  join(sessionToken: string, userAlias: string): Observable<CodeSession> {
    return this.http.post<CodeSession>(`${environment.hipEditApiPrefix}/auth/join`, {
      sessionToken, userAlias
    });
  }

  verifyBearerToken(bearerToken: string, sessionToken: string): Observable<void> {
    return this.http.head<void>(`${environment.hipEditApiPrefix}/auth/verify`, {
      params: { bearerToken, sessionToken }
    }).pipe(
      tap(null, null, () => this.store.dispatch(new LoginAction({sessionToken, bearerToken})))
    );
  }
}
