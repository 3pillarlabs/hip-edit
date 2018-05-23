import { BrowserModule, Title }    from '@angular/platform-browser';
import { NgModule }                from '@angular/core';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule }             from '@angular/forms';

import { AppComponent }            from './app.component';
import { MaterialModule }          from './material.module';
import { CodeEditorComponent }     from './code-editor/code-editor.component';
import { EditorEventService }      from './code-editor/editor-event.service';
import { PubsubService }           from './pubsub.service';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [
    Title,
    EditorEventService,
    PubsubService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
