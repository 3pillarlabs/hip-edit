import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.scss']
})
export class JoinSessionComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  joinSession(sessionToken: string, joinName: string) {
    console.debug(`sessionToken: ${sessionToken}, joinName: ${joinName}`);
    return this.router.navigate([{ outlets: { editors: ['session', sessionToken] } }]);
  }
}
