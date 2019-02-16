import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ScoreCard } from '../data-model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent implements OnInit {
  scoreCardText: string;
  showSuccess: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ScoreCard,
              @Inject(DOCUMENT) private document: Document) { }

  ngOnInit() {
    const sortedCategories: string[] = Object.keys(this.data).sort((a, b) => this.data[b].length - this.data[a].length);
    this.scoreCardText = sortedCategories.reduce((text: string, categoryId: string) => {
      const p = `[${categoryId}]\n` + this.data[categoryId].reduce((v, answerRating) => {
        return v + `  - ${answerRating.questionShort} (${answerRating.rating})\n`;
      }, '');
      return text + p;
    }, '');
  }

  onCopyClipboard(card: HTMLElement) {
    const selection = this.document.getSelection();
    const range = this.document.createRange();
    range.selectNodeContents(card);
    selection.removeAllRanges();
    selection.addRange(range);
    this.document.execCommand('copy');
    selection.removeAllRanges();
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 1500);
  }
}
