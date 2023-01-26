import { inject, TestBed } from '@angular/core/testing';
import { testImports } from '../../../test/test-util';

import { AuthInterceptor } from './auth-interceptor.service';

describe('AuthInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      providers: [AuthInterceptor],
    });
  });

  it('should be created', inject(
    [AuthInterceptor],
    (service: AuthInterceptor) => {
      expect(service).toBeTruthy();
    }
  ));
});
