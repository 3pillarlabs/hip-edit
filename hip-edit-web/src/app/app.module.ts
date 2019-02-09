import { BrowserModule, Title }    from '@angular/platform-browser';
import { NgModule }                from '@angular/core';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule }             from '@angular/forms';
import { ReactiveFormsModule }     from '@angular/forms';
import { RouterModule, Routes }    from '@angular/router';
import { StoreModule }             from '@ngrx/store';
import { StoreDevtoolsModule }     from '@ngrx/store-devtools';

import { environment }             from '../environments/environment';

import { MaterialModule }          from './material.module';
import { EditorModule }            from './editor/editor.module';
import { QuestionBankModule } from './question-bank/question-bank.module';

import { AppComponent }            from './app.component';
import { JoinSessionComponent }    from './join-session/join-session.component';
import { NewSessionComponent }     from './new-session/new-session.component';

import { PubsubService }           from './pubsub.service';
import { JoinSessionService }      from './join-session/join-session.service';

import { reducers, metaReducers }  from './reducers';

const appRoutes: Routes = [
  { path: '', component: JoinSessionComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    JoinSessionComponent,
    NewSessionComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    EditorModule,
    QuestionBankModule,
    RouterModule.forRoot(appRoutes),
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [
    Title,
    PubsubService,
    JoinSessionService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
