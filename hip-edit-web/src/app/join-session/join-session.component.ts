import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CodeSession } from '../domain/data-model';
import { JoinSessionService } from './join-session.service';
import { Store } from '@ngrx/store';
import { LoginAction } from '../actions/login.actions';
import { State } from '../reducers';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.scss']
})
export class JoinSessionComponent implements OnInit, OnDestroy {
  joinSessionForm: FormGroup;
  invalidSessionToken: boolean = false;
  private unsubscribe$: Subject<any>;

  constructor(private router: Router,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private joinSessionService: JoinSessionService,
              private store: Store<State>) {

    this.unsubscribe$ = new Subject<any>();
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params: ParamMap) => {
          let sessionToken = params.get('sessionToken');
          this.createForm(sessionToken);
          console.debug(`sessionToken: ${sessionToken}`);
        });

    this.route.queryParamMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params: ParamMap) => {
        if (params.has('bearerToken') && params.has('sessionToken')) {
          this.joinSessionForm.disable();
          const sessionToken = params.get('sessionToken');
          const bearerToken = params.get('bearerToken');
          this.joinSessionService.verifyBearerToken(bearerToken, sessionToken)
            .subscribe({
              complete: () => this.router.navigate(['editor', sessionToken]),
              error: () => {
                this.invalidSessionToken = true;
                this.joinSessionForm.enable();
              }
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.joinSessionService.join(sessionToken, userAlias)
      .subscribe({
        next: (cs) => {
          this.store.dispatch(new LoginAction({ sessionToken, bearerToken: cs.bearerToken }));
          this.router.navigate(['editor', sessionToken]);
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
