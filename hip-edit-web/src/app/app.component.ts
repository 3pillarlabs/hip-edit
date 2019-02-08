import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { State } from './reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  sessionEstablished$: Observable<boolean>;
  sessionToken$: Observable<string>;

  public constructor(private titleService: Title,
                     private store: Store<State>) { }

  ngOnInit() {
    this.titleService.setTitle('Rarity');
    this.sessionEstablished$ = this.store.select((state) => state.session.loggedIn);
    this.sessionToken$ = this.store.select((state) => state.session.sessionToken);
  }
}
