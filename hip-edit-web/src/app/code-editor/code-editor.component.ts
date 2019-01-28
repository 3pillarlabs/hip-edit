import { Component, OnInit, AfterViewInit, Input, NgZone } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { EditorEvent } from './code-editor-event';
import { EditorEventService } from './editor-event.service';
import { PubsubService } from '../pubsub.service';
import { AppStateService } from '../app-state.service';
import { AppStateKey } from '../app-state-key';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})

export class CodeEditorComponent implements OnInit, AfterViewInit {
  @Input() codeEditorText: string;

  private _sessionToken: string = null;
  private postObserver: ISubscription = null;
  private editorObserver: ISubscription = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private editorEventService: EditorEventService,
    private pubsubService: PubsubService,
    private ngZone: NgZone,
    private appStateService: AppStateService) { }

  ngOnInit() {
    if (!this.appStateService.hasKey(AppStateKey.BearerToken)) {
      return this.router.navigate([{ outlets: { editors: [''] } }]);
    }

    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        this.sessionToken = params.get('sessionToken');
        this.appStateService.setValue(AppStateKey.SessionToken, this.sessionToken);
        console.debug(`sessionToken: ${this.sessionToken}`);
      }
    });
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.editorObserver = this.pubsubService.editorEventsStream(this.sessionToken).subscribe({
        next: (editorEvent: EditorEvent) => {
          console.debug(editorEvent);
          this.ngZone.run(() => {
            this.codeEditorText = editorEvent.text;
          });
        },
        error: (error) => {
          console.error(error);
        }
      })
    });
  }

  ngOnDestroy() {
    if (this.postObserver) {
      this.postObserver.unsubscribe();
    }

    if (this.editorObserver) {
      this.editorObserver.unsubscribe();
    }
  }

  onChange(newCode: string) {
    console.debug(newCode);
    this.postObserver = this.editorEventService.postEvent(this.sessionToken, newCode).subscribe();
  }

  get sessionToken() {
    return this._sessionToken;
  }

  set sessionToken(newSessionToken: string) {
    this._sessionToken = newSessionToken;
  }
}
