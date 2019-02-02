import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { State } from '../reducers';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.scss']
})
export class NewSessionComponent implements OnInit {
  authUrl: string;
  sessionNotEstablished$: Observable<boolean>;

  constructor(private store: Store<State>) {
    this.authUrl = environment.production ? `${environment.hipEditApiPrefix}/auth/google` :
                                            `/login.html?action=${environment.hipEditApiPrefix}/auth/login`;
  }

  ngOnInit() {
    this.sessionNotEstablished$ = this.store.select((state) => !state.session.loggedIn);
  }

}
