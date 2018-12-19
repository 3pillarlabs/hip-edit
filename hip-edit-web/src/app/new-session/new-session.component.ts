import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { AppStateService } from '../app-state.service';
import { AppStateKey } from '../app-state-key';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.scss']
})
export class NewSessionComponent implements OnInit {
  authUrl: string;
  sessionNotEstablished: boolean = true;

  constructor(private appStateService: AppStateService) {
    this.authUrl = environment.production ? `${environment.hipEditApiPrefix}/auth/google` :
                                            `/login.html?action=${environment.hipEditApiPrefix}/auth/login`;
  }

  ngOnInit() {
    this.appStateService.subscribeKey(AppStateKey.SessionToken, {
      next: (_value) => this.sessionNotEstablished = false
    });
  }

}
