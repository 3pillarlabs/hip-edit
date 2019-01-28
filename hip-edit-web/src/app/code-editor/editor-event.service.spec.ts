import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";

import { EditorEventService } from './editor-event.service';
import { environment } from '../../environments/environment';
import { AppStateService } from '../app-state.service';
import { PartialObserver } from 'rxjs';

describe('EditorEventService', () => {
  let service: EditorEventService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ EditorEventService, AppStateService ],
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
      const bearerToken = 'd7fdeeb8a746964b';
      spyOn(AppStateService.prototype, 'now').and.callFake((_key: string, observer: PartialObserver<any>) => {
        observer.next(bearerToken);
      });
      service.postEvent('a3fp', 'foo').subscribe();
      const req = httpTestingController.expectOne(`${environment.hipEditApiPrefix}/api/events`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Authorization')).toEqual(bearerToken);
      req.flush(null);
      httpTestingController.verify();
    });
  });
});
