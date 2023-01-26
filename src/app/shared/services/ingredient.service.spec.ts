import { inject, TestBed } from '@angular/core/testing';
import { testImports } from '../../../test/test-util';

import { IngredientService } from './ingredient.service';

describe('IngredientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      providers: [IngredientService],
    });
  });

  it('should be created', inject(
    [IngredientService],
    (service: IngredientService) => {
      expect(service).toBeTruthy();
    }
  ));
});
