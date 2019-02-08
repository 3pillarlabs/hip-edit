import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { MaterialModule } from '../material.module';

import { EditorComponent } from './editor/editor.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';

import { EditorEventService } from './code-editor/editor-event.service';

const routes: Routes = [
  {
    path: 'editor/:sessionToken',
    component: EditorComponent
  }
];

@NgModule({
  declarations: [
    EditorComponent,
    CodeEditorComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    EditorEventService,
  ]
})
export class EditorModule { }
