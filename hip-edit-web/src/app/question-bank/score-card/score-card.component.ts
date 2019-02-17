import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ScoreCard } from '../data-model';
import { DOCUMENT } from '@angular/common';
import * as _ from 'lodash';

interface RatingBlock {
  lb: number;
  ub: number;
  status: string;
  desc: string;
}
@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent implements OnInit {
  scoreCardText: string;
  showSuccess: boolean = false;
  ratingBlocks: RatingBlock[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ScoreCard,
              @Inject(DOCUMENT) private document: Document) { }

  ngOnInit() {
    this.fillRatingBlocks();
    this.scoreCardText = this.renderSummary() + "\n" + this.renderDetails();
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

  renderDetails(): string {
    return "Detail\n" +
      this.renderDivider() +
      this.sortedCategories.reduce((text: string, categoryId: string) => {
        const p = `[${categoryId}]\n` + this.data[categoryId].reduce((v, answerRating) => {
          return v + `  - ${answerRating.questionShort} (${answerRating.rating})\n`;
        }, '');
        return text + p;
      }, '');
  }

  renderSummary(): string {
    let totalScore = 0;
    let questionCount = 0;
    return "Summary\n" +
      this.renderDivider() +
      "Scores by category\n" +
      this.renderDivider('-') +
      this.sortedCategories.reduce((text: string, categoryId: string) => {
        const catScore = this.data[categoryId].reduce((sum, answerRating) => sum + answerRating.rating, 0);
        totalScore += catScore;
        questionCount += this.data[categoryId].length;
        return text + `[${categoryId}]: ${catScore}\n`;
      }, '') +
      "Total\n" +
      this.renderDivider('-') +
      `Score: ${totalScore}\n` +
      `#Questions: ${questionCount}\n` +
      `Average Score: ${(totalScore/questionCount).toFixed(2)}\n`;
  }

  renderDivider(delim: string = '_', length: number = 60): string {
    return new Array(length).fill(delim).join('') + "\n";
  }

  get sortedCategories(): string[] {
    return Object.keys(this.data).sort((a, b) => this.data[b].length - this.data[a].length);
  }

  get averageScore(): number {
    return this.sortedCategories.reduce((total: number, categoryId: string) => total + this.data[categoryId].reduce(
      (sum, answer) => sum + answer.rating, 0
    ), 0) / Object.values(this.data).reduce((count, answers) => count + answers.length, 0);
  }

  fillRatingBlocks() {
    const avgScore = this.averageScore;
    [
      { lb: 0, ub: 1, status: 'not-hire', desc: 'Could not answer or answered questions partially' },
      { lb: 1, ub: 2, status: 'may-hire', desc: 'Answered some questions partially or up to expectations' },
      { lb: 2, ub: 3, status: 'yes-hire', desc: 'Answered questions as per or exceeding expectations' },
    ].forEach((block: RatingBlock) => {
      if (avgScore >= block.lb && avgScore < block.ub) {
        block.status += ' active';
      }
      this.ratingBlocks.push(block);
    });
  }
}
