export interface Category {
  id: string;
  title: string;
  root: string;
  tags?: string[];
  short?: string;
}

export interface Question {
  id: string;
  short: string,
  categoryId: string
}
