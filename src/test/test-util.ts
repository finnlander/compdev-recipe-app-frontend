import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { initialAuthState } from '../app/auth/store';
import { initialRecipeState } from '../app/recipes/store';
import { SharedModule } from '../app/shared/shared.module';
import { initialShoppingListState } from '../app/shopping-list/store';
import { reducers, RootState } from '../app/store/app.store';

/**
 * Initial store state for testing purposes.
 */
export const initialTestState: RootState = {
  auth: initialAuthState,
  recipes: initialRecipeState,
  shoppingList: initialShoppingListState,
};

/**
 * Basic imports for test classes.
 */
export const testImports = [
  HttpClientTestingModule,
  RouterTestingModule,
  StoreModule.forRoot(reducers),
  SharedModule,
];
