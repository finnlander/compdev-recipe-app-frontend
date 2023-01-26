import { inject, TestBed } from '@angular/core/testing';
import { testImports } from '../../../test/test-util';

import { ErrorInterceptor } from './error-interceptor.service';

describe('ErrorInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      providers: [ErrorInterceptor],
    });
  });

  it('should be created', inject(
    [ErrorInterceptor],
    (service: ErrorInterceptor) => {
      expect(service).toBeTruthy();
    }
  ));
});
