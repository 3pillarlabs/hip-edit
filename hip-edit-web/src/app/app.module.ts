import { BrowserModule, Title }    from '@angular/platform-browser';
import { NgModule }                from '@angular/core';
import { AppComponent }            from './app.component';
import { MaterialModule }          from './material.module';
import { CodeEditorComponent }     from './code-editor/code-editor.component';
import { PubsubService }           from './pubsub.service';
import { HttpClientModule }        from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [
    Title,
    PubsubService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
