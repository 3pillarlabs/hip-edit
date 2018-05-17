import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { EditorEvent } from './code-editor-event';
import { EditorEventService } from './editor-event.service';
import { PubsubService } from '../pubsub.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})

export class CodeEditorComponent implements OnInit, AfterViewInit {
  private _sessionToken: string = null;
  private postObserver: ISubscription = null;
  private editorObserver: ISubscription = null;

  constructor(
    private editorEventService: EditorEventService,
    private pubsubService: PubsubService) { }

  ngOnInit() {
    // TODO: use the location or some other strategy to get the sessionToken
    this.sessionToken = 'eb6e7dc8-9fe3-4bec-b211-661af5e9209c';
  }

  ngAfterViewInit() {
    this.editorObserver = this.pubsubService.editorEventsStream(this.sessionToken).subscribe({
      next: (editorEvent: EditorEvent) => {
        console.debug(editorEvent);
      },
      error: (error) => {
        console.error(error);
      }
    })
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
