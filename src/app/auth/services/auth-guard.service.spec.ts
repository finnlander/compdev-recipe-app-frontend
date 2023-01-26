import { inject, TestBed } from '@angular/core/testing';
import { testImports } from '../../../test/test-util';
import { AuthGuard } from './auth-guard.service';

describe('AuthGuardServiceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      providers: [AuthGuard],
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
