import { inject, TestBed } from '@angular/core/testing';

import { BackendMockInterceptor } from './backend-mock-interceptor.service';

describe('BackendMockInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendMockInterceptor],
    });
  });

  it('should be created', inject(
    [BackendMockInterceptor],
    (service: BackendMockInterceptor) => {
      expect(service).toBeTruthy();
    }
  ));
});
