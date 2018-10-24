import { BrowserModule, Title }    from '@angular/platform-browser';
import { NgModule }                from '@angular/core';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule }             from '@angular/forms';
import { RouterModule, Routes }    from '@angular/router';

import { AppComponent }            from './app.component';
import { MaterialModule }          from './material.module';
import { CodeEditorComponent }     from './code-editor/code-editor.component';
import { EditorEventService }      from './code-editor/editor-event.service';
import { PubsubService }           from './pubsub.service';
import { JoinSessionComponent }    from './join-session/join-session.component';

const appRoutes: Routes = [
  { path: 'session/:sessionToken', component: CodeEditorComponent,  outlet: 'editors' },
  { path: '',                      component: JoinSessionComponent, outlet: 'editors' }
];

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    JoinSessionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    Title,
    EditorEventService,
    PubsubService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
