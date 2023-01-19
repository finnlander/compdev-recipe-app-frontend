import { ActionReducerMap } from '@ngrx/store';
import { AuthEffects, authReducer, AuthState } from '../auth/store';
import { RecipeEffects, recipeReducer, RecipeState } from '../recipes/store';
import {
  ShoppingListEffects,
  shoppingListReducer,
  ShoppingListState,
} from '../shopping-list/store';

/**
 * Root ngrx state for the app.
 */
export interface RootState {
  auth: AuthState;
  recipes: RecipeState;
  shoppingList: ShoppingListState;
}

/**
 * App's root reducer statement.
 */
export const reducers: ActionReducerMap<RootState> = {
  auth: authReducer,
  recipes: recipeReducer,
  shoppingList: shoppingListReducer,
};

/**
 * App's ngrx effects.
 */
export const effects = [AuthEffects, RecipeEffects, ShoppingListEffects];
