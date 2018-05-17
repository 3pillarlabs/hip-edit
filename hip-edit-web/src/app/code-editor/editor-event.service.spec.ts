import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";

import { EditorEventService } from './editor-event.service';
import { environment } from '../../environments/environment';

describe('EditorEventService', () => {
  let service: EditorEventService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorEventService],
      imports: [HttpClientTestingModule]
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(EditorEventService);
  });

  it('should be created', inject([EditorEventService], (service: EditorEventService) => {
    expect(service).toBeTruthy();
  }));

  describe('#postEvent', () => {
    it('should post Event data', () => {
      service.postEvent('a3fp', 'foo').subscribe();
      const req = httpTestingController.expectOne(`${environment.hipEditApiPrefix}/events`);
      expect(req.request.method).toEqual('POST');
      req.flush(null);
      httpTestingController.verify();
    });
  });
});
