import { inject, TestBed } from '@angular/core/testing';
import { testImports } from '../../../test/test-util';

import { RecipesResolverService } from './recipes-resolver.service';

describe('RecipesResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...testImports],
      providers: [RecipesResolverService],
    });
  });

  it('should be created', inject(
    [RecipesResolverService],
    (service: RecipesResolverService) => {
      expect(service).toBeTruthy();
    }
  ));
});
