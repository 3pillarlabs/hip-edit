import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { QuestionBankService } from './question-bank.service';
import { environment } from '../../environments/environment';

describe('QuestionBankService', () => {
  let httpTestingController: HttpTestingController;
  let service: QuestionBankService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionBankService],
      imports: [HttpClientTestingModule]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(QuestionBankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#categories', () => {
    it('should fetch categories', () => {
      const categories = [
        { "id": "python-core", "title": "Python", "root": "python" },
        { "id": "react-web", "title": "React JS", "root": "react" }
      ];
      const recorder = jasmine.createSpy('Recorder');
      service.categories().subscribe((data) => recorder(data));
      const mock = httpTestingController.expectOne(`${environment.hipEditApiPrefix}/question-bank/categories`);
      expect(mock.request.method).toEqual('GET');
      mock.flush(categories, {
        headers: { 'Content-Type': 'application/json' }
      });

      httpTestingController.verify();
      expect(recorder).toHaveBeenCalledWith(categories);
    });
  });

  describe('#questions', () => {
    it('should fetch questions', () => {
      const questions = [
        { id: 'a', short: 'What is the difference between a stub, mock and spy?' },
        { id: 'b', short: 'How do you chain RxJs operators, and why do you need chaining?' }
      ]
      const recorder = jasmine.createSpy('Recorder');
      const category = 'java-core';
      service.questions(category).subscribe((data) => recorder(data));
      const mock = httpTestingController.expectOne(
        `${environment.hipEditApiPrefix}/question-bank/questions?categoryId=${category}`);
      expect(mock.request.method).toEqual('GET');
      mock.flush(questions, {
        headers: { 'Content-Type': 'application/json' }
      });

      httpTestingController.verify();
      expect(recorder).toHaveBeenCalledWith(questions);
    });
  });

  describe('#question', () => {
    it('should fetch the question', () => {
      const question = {
        "id": "238304c0-66ff-4574-81ed-08df7dad0ce2",
        "categoryId": "java-core",
        "short": "What is the difference between a class and an interface?",
        "tags": ["java"],
        "expect": {
          "meet": [
            "Interfaces are used to define a contract, while a class is used to define the domain"
          ]
        }
      };

      const recorder = jasmine.createSpy('Recorder');
      const questionId = question['id'];
      service.question(questionId).subscribe((data) => recorder(data));
      const mock = httpTestingController.expectOne(
        `${environment.hipEditApiPrefix}/question-bank/questions/${questionId}`);
      expect(mock.request.method).toEqual('GET');
      mock.flush(question, {
        headers: { 'Content-Type': 'application/json' }
      });

      httpTestingController.verify();
      expect(recorder).toHaveBeenCalledWith(question);
    });
  });
});
