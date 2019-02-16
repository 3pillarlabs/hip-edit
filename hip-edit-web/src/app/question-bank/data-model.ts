export interface Category {
  id: string;
  title: string;
  root: string;
  tags?: string[];
  short?: string;
}

export interface AnswerExpectation {
  meet: string[];
  exceed?: string[];
}

export interface Question {
  id: string;
  short: string,
  categoryId: string,
  tags?: string[],
  expect?: AnswerExpectation
}

export interface AnswerRating {
  categoryId: string,
  questionId: string,
  rating: number;
  questionShort: string;
}

export interface QuestionAnswerRatingMap {
  [questionId: string]: AnswerRating;
}

export interface ScoreCard {
  [categoryId: string]: AnswerRating[];
}
