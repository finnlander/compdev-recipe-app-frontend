import {
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import { shoppingListActions as actions } from '.';
import { ShoppingListItem } from '../models/shopping-list-item-model';

/**
 * Shopping list feature state.
 */
export interface ShoppingListState {
  /**
   * Current items in shopping list.
   */
  items: ShoppingListItem[];
  /**
   * Item currently selected in shopping list. ('null' if none is selected).
   */
  selectedItem: ShoppingListItem | null;
  /**
   * Pending shopping list change operations.
   */
  pendingChanges: number;
  /**
   * Error occurred with latest update operation.
   */
  error: string | null;
}

const initialState: Readonly<ShoppingListState> = {
  items: [],
  selectedItem: null,
  pendingChanges: 0,
  error: null,
};

/**
 * Shopping list state reducer.
 */
export const shoppingListReducer = createReducer(
  initialState,
  on(actions.clearItems, (_, __) => ({
    ...initialState,
  })),
  on(
    actions.addItemRequest,
    actions.addItemsRequest,
    actions.updateItemRequest,
    (state, _) => ({
      ...state,
      pendingChanges: state.pendingChanges + 1,
      error: null,
    })
  ),
  on(actions.addItemSuccess, (state, { ingredient, amount, unit }) => ({
    ...state,
    pendingChanges: state.pendingChanges - 1,
    error: null,
    items: [
      ...state.items,
      {
        ordinal: state.items.length + 1,
        ingredient,
        amount,
        unit,
      },
    ],
  })),
  on(actions.addItemsSuccess, (state, { items }) => {
    const updatedItems: ShoppingListItem[] = [...state.items];
    items.forEach((newItem) => {
      const existingRowIndex = updatedItems.findIndex(
        (it) =>
          it.ingredient.name === newItem.ingredient.name &&
          it.unit === newItem.unit
      );
      if (existingRowIndex >= 0) {
        const existingItem = updatedItems[existingRowIndex];
        updatedItems[existingRowIndex] = {
          ...existingItem,
          amount: existingItem.amount + newItem.amount,
        };
      } else {
        updatedItems.push({
          ordinal: updatedItems.length + 1,
          ingredient: newItem.ingredient,
          amount: newItem.amount,
          unit: newItem.unit,
        });
      }
    });

    return {
      ...state,
      pendingChanges: state.pendingChanges - 1,
      error: null,
      items: updatedItems,
    };
  }),
  on(
    actions.updateItemSuccess,
    (state, { ordinal, ingredient, amount, unit }) => {
      const updatedItem = {
        ordinal,
        ingredient,
        amount,
        unit,
      };
      return {
        ...state,
        pendingChanges: state.pendingChanges - 1,
        error: null,
        items: [
          ...state.items.map((it) =>
            it.ordinal === ordinal ? updatedItem : it
          ),
        ],
        selectedItem:
          ordinal === state.selectedItem?.ordinal
            ? updatedItem
            : state.selectedItem,
      };
    }
  ),
  on(actions.removeItem, (state, { ordinal }) => ({
    ...state,
    error: null,
    items: [
      ...state.items
        .filter((it) => it.ordinal !== ordinal)
        .map((it, index) => ({
          ...it,
          ordinal: index + 1,
        })),
    ],
    selectedItem:
      ordinal === state.selectedItem?.ordinal ? null : state.selectedItem,
  })),
  on(actions.updateFailed, (state, { error }) => ({
    ...state,
    error,
  })),
  on(actions.clearUpdateError, (state, _) =>
    state.error
      ? {
          ...state,
          error: null,
        }
      : state
  ),
  on(actions.setSelectedItem, (state, { item }) => ({
    ...state,
    selectedItem: item,
  }))
);

/* Prepared selectors */

const getShoppingListStateSelector =
  createFeatureSelector<ShoppingListState>('shoppingList');

const isShoppingListUpdatingSelector = createSelector(
  getShoppingListStateSelector,
  (state) => state.pendingChanges > 0
);

const getShoppingListItemsSelector = createSelector(
  getShoppingListStateSelector,
  (state) => state.items
);

const getShoppingListCountSelector = createSelector(
  getShoppingListStateSelector,
  (state) => state.items.length
);

const getShoppingListUpdateErrorSelector = createSelector(
  getShoppingListStateSelector,
  (state) => state.error
);

const getSelectedItemSelector = createSelector(
  getShoppingListStateSelector,
  (state) => state.selectedItem
);

/**
 * Prepared ngrx selectors for shopping list state values.
 */
export const shoppingListSelectors = {
  getShoppingListItems: getShoppingListItemsSelector,
  getShoppingListCount: getShoppingListCountSelector,
  isShoppingListUpdating: isShoppingListUpdatingSelector,
  getShoppingListUpdateError: getShoppingListUpdateErrorSelector,
  getSelectedItem: getSelectedItemSelector,
};
