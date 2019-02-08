import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

import { LogoutAction } from '../actions/login.actions';
import { State } from '../reducers';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.scss']
})
export class NewSessionComponent implements OnInit {
  authUrl: string;
  sessionEstablished$: Observable<boolean>;

  constructor(private store: Store<State>, private router: Router) {
    this.authUrl = environment.production ? `${environment.hipEditApiPrefix}/auth/google` :
                                            `/login.html?action=${environment.hipEditApiPrefix}/auth/login`;
  }

  ngOnInit() {
    this.sessionEstablished$ = this.store.select((state) => state.session.loggedIn);
  }

  onLogout() {
    this.router.navigate(['']).then(() => this.store.dispatch(new LogoutAction()));
  }
}
