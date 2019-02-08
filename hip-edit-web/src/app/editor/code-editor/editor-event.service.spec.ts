import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Store, StoreModule } from '@ngrx/store';

import { EditorEventService } from './editor-event.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

describe('EditorEventService', () => {
  let service: EditorEventService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ EditorEventService ],
      imports: [HttpClientTestingModule, StoreModule.forRoot({})]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(EditorEventService);
  });

  it('should be created', inject([EditorEventService], (service: EditorEventService) => {
    expect(service).toBeTruthy();
  }));

  describe('#postEvent', () => {
    it('should post Event data', () => {
      const bearerToken = 'd7fdeeb8a746964b';
      spyOn(Store.prototype, 'select').and.returnValue(new Observable<any>((observer) => observer.next({bearerToken})));
      service.postEvent('a3fp', 'foo').subscribe();
      const req = httpTestingController.expectOne(`${environment.hipEditApiPrefix}/api/events`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Authorization')).toEqual(bearerToken);
      req.flush(null);
      httpTestingController.verify();
    });
  });
});
