import { TestBed, inject } from '@angular/core/testing';

import { AppStateService } from './app-state.service';
import { AppStateKey } from './app-state-key';

describe('AppStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStateService]
    });
  });

  it('should be created', inject([AppStateService], (service: AppStateService) => {
    expect(service).toBeTruthy();
  }));

  it('should create a key without observers', inject([AppStateService], (service: AppStateService) => {
    service.setValue(AppStateKey.TestKey, 'bar');
  }));

  it('should inform a new observer for an existing value', inject([AppStateService], (service: AppStateService) => {
    service.setValue(AppStateKey.TestKey, 'bar');
    let subscribedValue = undefined;
    service.subscribeKey(AppStateKey.TestKey, {
      next: (value) => {
        subscribedValue = value;
      }
    });
    expect(subscribedValue).toBe('bar');
  }));

  it('should inform observers of new key', inject([AppStateService], (service: AppStateService) => {
    const subscribedValues = [];
    service.subscribeKey(AppStateKey.TestKey, {
      next: (value) => {
        subscribedValues.push(value);
      }
    });
    service.subscribeKey(AppStateKey.TestKey, {
      next: (value) => {
        subscribedValues.push(value);
      }
    });
    expect(subscribedValues).toEqual([]);
    service.setValue(AppStateKey.TestKey, 'bar');
    expect(subscribedValues).toEqual(['bar', 'bar']);
  }));
});
