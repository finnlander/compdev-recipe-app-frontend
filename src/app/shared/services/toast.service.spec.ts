import { inject, TestBed } from '@angular/core/testing';
import { testImports } from '../../../test/test-util';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      providers: [ToastService],
    });
  });

  it('should be created', inject([ToastService], (service: ToastService) => {
    expect(service).toBeTruthy();
  }));
});
