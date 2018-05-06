import { NgModule }                from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule }          from '@angular/material';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MatInputModule
  ],
  exports: [
    BrowserAnimationsModule,
    MatInputModule
  ]
})

export class MaterialModule { }
