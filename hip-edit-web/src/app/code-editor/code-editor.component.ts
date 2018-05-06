import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { PubsubService } from '../pubsub.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})

export class CodeEditorComponent implements OnInit {

  constructor(private pubsubService: PubsubService) { }

  ngOnInit() {
  }

  onChange(newCode: string) {
    console.debug(newCode);
    this.pubsubService.postEvent(newCode).subscribe();
  }
}
