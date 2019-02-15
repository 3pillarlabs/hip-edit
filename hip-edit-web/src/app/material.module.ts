import { NgModule }                from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule }          from '@angular/material';
import { MatButtonModule }         from '@angular/material';
import { MatCardModule}            from '@angular/material';
import { MatProgressBarModule }    from '@angular/material/progress-bar';
import { MatListModule }           from '@angular/material/list';
import { MatChipsModule }          from '@angular/material/chips';
import { MatDividerModule }        from '@angular/material/divider';
import { MatSliderModule }         from '@angular/material/slider';
import { MatDialogModule }         from '@angular/material/dialog';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatSliderModule,
    MatDialogModule
  ],
  exports: [
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatSliderModule,
    MatDialogModule
  ]
})

export class MaterialModule { }
