import {
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import {
  shoppingListActions as actions,
  ShoppingListItemSuccessPayload,
} from '.';
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

export const initialShoppingListState: Readonly<ShoppingListState> = {
  items: [],
  selectedItem: null,
  pendingChanges: 0,
  error: null,
};

/**
 * Shopping list state reducer.
 */
export const shoppingListReducer = createReducer(
  initialShoppingListState,
  on(actions.clearItems, () => ({
    ...initialShoppingListState,
  })),
  on(
    actions.addItemRequest,
    actions.addItemsRequest,
    actions.updateItemRequest,
    (state) => ({
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
    const updatedItems: ShoppingListItem[] = mergeShoppingListItems(
      state.items,
      items
    );

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
  on(actions.clearUpdateError, (state) =>
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
  })),
  on(actions.loadStoredItemsSuccess, (state, { items }) => ({
    ...state,
    items,
    selectedItem: state.selectedItem
      ? items.find((it) => it.ordinal === state.selectedItem?.ordinal) || null
      : null,
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

/* Helper Functions */

function mergeShoppingListItems(
  existingItems: ShoppingListItem[],
  newItems: ShoppingListItemSuccessPayload[]
) {
  const mergedItems: ShoppingListItem[] = [...existingItems];

  newItems.forEach((newItem) => {
    const existingRowIndex = mergedItems.findIndex(
      (it) =>
        it.ingredient.name === newItem.ingredient.name &&
        it.unit === newItem.unit
    );
    if (existingRowIndex >= 0) {
      const existingItem = mergedItems[existingRowIndex];
      mergedItems[existingRowIndex] = {
        ...existingItem,
        amount: existingItem.amount + newItem.amount,
      };
    } else {
      mergedItems.push({
        ordinal: mergedItems.length + 1,
        ingredient: newItem.ingredient,
        amount: newItem.amount,
        unit: newItem.unit,
      });
    }
  });

  return mergedItems;
}
