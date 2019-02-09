import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category, Question } from './data-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionBankService {

  constructor(private http: HttpClient) { }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.hipEditApiPrefix}/question-bank/categories`);
  }

  questions(categoryId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${environment.hipEditApiPrefix}/question-bank/questions?categoryId=${categoryId}`);
  }

  question(questionId: string): Observable<Question> {
    return this.http.get<Question>(`${environment.hipEditApiPrefix}/question-bank/questions/${questionId}`);
  }
}
