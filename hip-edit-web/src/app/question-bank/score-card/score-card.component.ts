import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ScoreCard } from '../data-model';

@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ScoreCard) { }

  ngOnInit() {
  }

}
