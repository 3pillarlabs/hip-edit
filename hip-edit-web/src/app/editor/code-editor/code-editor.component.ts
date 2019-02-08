import { Component, OnInit, AfterViewInit, Input, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { EditorEvent } from '../../domain/code-editor-event';
import { EditorEventService } from './editor-event.service';
import { PubsubService } from '../../pubsub.service';
import { State } from '../../reducers';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})

export class CodeEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() codeEditorText: string;
  private _sessionToken: string = null;
  private unsubscribe$: Subject<any>;

  constructor(private router: Router,
              private editorEventService: EditorEventService,
              private pubsubService: PubsubService,
              private ngZone: NgZone,
              private store: Store<State>) {

    this.unsubscribe$ = new Subject<any>();
  }

  ngOnInit() {
    // FIXME: Use router guard
    this.store
      .select(state => state.session.loggedIn)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((loggedIn: boolean) => {
        if (!loggedIn) {
          this.router.navigate([""]);
        }
      });

    // TODO: explore idiomatic rxjs usage
    this.store
      .select(state => state.session.sessionToken)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: string) => this.sessionToken = value);
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.pubsubService.editorEventsStream(this.sessionToken)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
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
    console.debug("CodeEditorComponent#ngOnDestroy");
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onChange(newCode: string) {
    console.debug(newCode);
    this.editorEventService.postEvent(this.sessionToken, newCode).subscribe();
  }

  get sessionToken() {
    return this._sessionToken;
  }

  set sessionToken(newSessionToken: string) {
    this._sessionToken = newSessionToken;
  }
}
