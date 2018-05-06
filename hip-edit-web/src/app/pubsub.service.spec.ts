import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";
import { PubsubService } from './pubsub.service';
import { environment } from '../environments/environment';

describe('PubsubService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PubsubService],
      imports: [HttpClientTestingModule]
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([PubsubService], (service: PubsubService) => {
    expect(service).toBeTruthy();
  }));

  describe('#postEvent', () => {
    it('should post Event data', inject([PubsubService], (service: PubsubService) => {
      service.postEvent("foo").subscribe();
      const req = httpTestingController.expectOne(`${environment.hipEditApiPrefix}/events`);
      expect(req.request.method).toEqual('POST');
      req.flush(null);
      httpTestingController.verify();
    }));
  });
});
