import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CodeSession } from './data-model';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.scss']
})
export class JoinSessionComponent implements OnInit {
  joinSessionForm: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        let sessionToken = params.get('sessionToken');
        this.createForm(sessionToken);
        console.debug(`sessionToken: ${sessionToken}`);
      },
      error: (error) => {
        console.error(error);
      }
    });
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
    console.debug(`this.joinSessionForm.valid: ${this.joinSessionForm.valid}`);
    if (this.joinSessionForm.invalid) {
      console.debug(this.joinSessionForm.errors);
      return false;
    }

    const formModel = this.joinSessionForm.value as CodeSession;
    const sessionToken = formModel.sessionToken;
    const userAlias = formModel.userAlias;
    console.debug(`sessionToken: ${sessionToken}, userAlias: ${userAlias}`);
    return this.router.navigate([{ outlets: { editors: ['session', sessionToken] } }]);
  }
}