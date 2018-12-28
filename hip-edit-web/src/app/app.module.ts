import { BrowserModule, Title }    from '@angular/platform-browser';
import { NgModule }                from '@angular/core';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes }    from '@angular/router';

import { AppComponent }            from './app.component';
import { MaterialModule }          from './material.module';
import { CodeEditorComponent }     from './code-editor/code-editor.component';
import { EditorEventService }      from './code-editor/editor-event.service';
import { PubsubService }           from './pubsub.service';
import { JoinSessionComponent }    from './join-session/join-session.component';
import { NewSessionComponent }     from './new-session/new-session.component';
import { AppStateService }         from './app-state.service';
import { JoinSessionService }      from './join-session/join-session.service';

const appRoutes: Routes = [
  { path: 'session/:sessionToken', component: CodeEditorComponent,  outlet: 'editors' },
  { path: 'session/:sessionToken/join', component: JoinSessionComponent,  outlet: 'editors' },
  { path: '',                      component: JoinSessionComponent, outlet: 'editors' }
];

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    JoinSessionComponent,
    NewSessionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    Title,
    EditorEventService,
    PubsubService,
    AppStateService,
    JoinSessionService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
