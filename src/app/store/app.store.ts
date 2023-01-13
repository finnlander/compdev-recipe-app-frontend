import {
  ShoppingListEffects,
  shoppingListReducer,
  ShoppingListState,
} from '../shopping-list/store';

/**
 * Root ngrx state for the app.
 */
export interface RootState {
  shoppingList: ShoppingListState;
}

/**
 * App's root reducer statement.
 */
export const reducers = {
  shoppingList: shoppingListReducer,
};

/**
 * App's ngrx effects.
 */
export const effects = [ShoppingListEffects];
