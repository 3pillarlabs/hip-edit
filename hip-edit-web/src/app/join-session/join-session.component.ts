import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CodeSession } from './data-model';
import { JoinSessionService } from './join-session.service';
import { AppStateService } from '../app-state.service';
import { AppStateKey } from '../app-state-key';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.scss']
})
export class JoinSessionComponent implements OnInit {
  joinSessionForm: FormGroup;
  invalidSessionToken: boolean = false;

  constructor(private router: Router,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private joinSessionService: JoinSessionService,
              private appStateService: AppStateService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        let sessionToken = params.get('sessionToken');
        this.createForm(sessionToken);
        console.debug(`sessionToken: ${sessionToken}`);
      }
    });

    this.route.queryParamMap.subscribe({
      next: (params: ParamMap) => {
        if (params.has('bearerToken') && params.has('sessionToken')) {
          this.appStateService.setValue(AppStateKey.BearerToken, params.get('bearerToken'));
          this.router.navigate([{ outlets: { editors: ['session', params.get('sessionToken')] } }]);
        }
      }
    })
  }

  createForm(sessionToken?: string) {
    this.joinSessionForm = this.fb.group({
      sessionToken: [sessionToken, [
        Validators.required,
        Validators.maxLength(36),
        Validators.pattern('[a-zA-Z0-9\-]+'),
      ]],
      userAlias: ['', Validators.required]
    });
  }

  onSubmit() {
    this.invalidSessionToken = false;
    console.debug(`this.joinSessionForm.valid: ${this.joinSessionForm.valid}`);
    if (this.joinSessionForm.invalid) {
      console.debug(this.joinSessionForm.errors);
      return false;
    }

    const formModel = this.joinSessionForm.value as CodeSession;
    const sessionToken = formModel.sessionToken;
    const userAlias = formModel.userAlias;
    console.debug(`sessionToken: ${sessionToken}, userAlias: ${userAlias}`);
    this.joinSessionForm.disable();
    this.joinSessionService.join(sessionToken, userAlias).subscribe({
      next: (cs) => {
        this.appStateService.setValue(AppStateKey.BearerToken, cs.bearerToken);
        console.debug('herw 1');
        this.router.navigate([{ outlets: { editors: ['session', sessionToken] } }]);
        console.debug('herw 2');
      },
      error: (error) => {
        console.error(error);
        this.invalidSessionToken = true;
        this.joinSessionForm.enable();
      }
    });
  }

  onChangeSessionToken(value: string) {
    if (value.trim().length == 0) {
      this.invalidSessionToken = false;
    }
  }
}
