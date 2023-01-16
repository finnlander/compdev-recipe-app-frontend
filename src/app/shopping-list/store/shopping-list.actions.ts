/* Action type */

import { createAction, props } from '@ngrx/store';
import { Ingredient } from '../../shared/models/ingredient.model';
import {
  ErrorContainer,
  ItemContainer,
  ItemsContainer,
} from '../../shared/models/payloads.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ShoppingListItem } from '../models/shopping-list-item-model';

/* Types */

export enum ShoppingListActionTypes {
  ADD_ITEM_REQUEST = '[Shopping List] Add Item request',
  ADD_ITEM_SUCCESS = '[Shopping List] Add Item success',
  ADD_ITEMS_REQUEST = '[Shopping List] Add Items request',
  ADD_ITEMS_SUCCESS = '[Shopping List] Add Items success',
  UPDATE_ITEM_REQUEST = '[Shopping List] Update Item request',
  UPDATE_ITEM_SUCCESS = '[Shopping List] Update Item success',
  REMOVE_ITEM = '[Shopping List] Remove Item',
  UPDATE_FAILED = '[Shopping List] Update failed',
  CLEAR_ITEMS = '[Shopping List] Clear items',
  CLEAR_UPDATE_ERROR = '[Shopping List] Clear update error',
  SET_SELECTED_ITEM = '[Shopping List] Set selected item',
}

interface PayloadWithOrdinal {
  ordinal: number;
}

interface ShoppingListItemRequestPayload {
  readonly ingredientName: string;
  readonly amount: number;
  readonly unit: RecipeUnit;
}

export interface ShoppingListItemSuccessPayload {
  readonly ingredient: Ingredient;
  readonly amount: number;
  readonly unit: RecipeUnit;
}

type UpdateShoppingListItemRequestPayload = PayloadWithOrdinal &
  ShoppingListItemRequestPayload;

type UpdateShoppingListItemSuccessPayload = PayloadWithOrdinal &
  ShoppingListItemSuccessPayload;

/* Actions */

/**
 * Ngrx action to request adding new item into the shopping list.
 */
const addShoppingListItemRequestAction = createAction(
  ShoppingListActionTypes.ADD_ITEM_REQUEST,
  props<ShoppingListItemRequestPayload>()
);

/**
 * Ngrx action to report success of adding new item into the shopping list.
 */
const addShoppingListItemSuccessAction = createAction(
  ShoppingListActionTypes.ADD_ITEM_SUCCESS,
  props<ShoppingListItemSuccessPayload>()
);

/**
 * Ngrx action to request adding multiple new items into the shopping list.
 */
const addMultipleShoppingListItemsRequestAction = createAction(
  ShoppingListActionTypes.ADD_ITEMS_REQUEST,
  props<ItemsContainer<ShoppingListItemRequestPayload>>()
);

/**
 * Ngrx action to report success of adding multiple new item into the shopping list.
 */
const addMultipleShoppingListItemsSuccessAction = createAction(
  ShoppingListActionTypes.ADD_ITEMS_SUCCESS,
  props<ItemsContainer<ShoppingListItemSuccessPayload>>()
);

/**
 * Ngrx action to request update of existing item in the shopping list.
 */
const updateShoppingListItemRequestAction = createAction(
  ShoppingListActionTypes.UPDATE_ITEM_REQUEST,
  props<UpdateShoppingListItemRequestPayload>()
);

/**
 * Ngrx action to report success of updating existing item in the shopping list.
 */
const updateShoppingListItemSuccessAction = createAction(
  ShoppingListActionTypes.UPDATE_ITEM_SUCCESS,
  props<UpdateShoppingListItemSuccessPayload>()
);

/**
 * Ngrx action to remove existing item from the shopping list.
 */
const removeShoppingListItemAction = createAction(
  ShoppingListActionTypes.REMOVE_ITEM,
  props<PayloadWithOrdinal>()
);

/**
 * Ngrx action to report failure of adding/updating/removing shopping list item.
 */
const shoppingListUpdateErrorAction = createAction(
  ShoppingListActionTypes.UPDATE_FAILED,
  props<ErrorContainer>()
);

/**
 * Ngrx action to set item targeted for editing.
 */
const setSelectedItemAction = createAction(
  ShoppingListActionTypes.SET_SELECTED_ITEM,
  props<ItemContainer<ShoppingListItem>>()
);

/**
 * Ngrx action to clear (reset) entire shopping list.
 */
const clearShoppingListAction = createAction(
  ShoppingListActionTypes.CLEAR_ITEMS
);

/**
 * Ngrx action to clear update error.
 */
const clearUpdateErrorAction = createAction(
  ShoppingListActionTypes.CLEAR_UPDATE_ERROR
);

/**
 * Rxjs store actions for shopping list feature.
 */
export const shoppingListActions = {
  addItemRequest: addShoppingListItemRequestAction,
  addItemSuccess: addShoppingListItemSuccessAction,
  addItemsRequest: addMultipleShoppingListItemsRequestAction,
  addItemsSuccess: addMultipleShoppingListItemsSuccessAction,
  clearItems: clearShoppingListAction,
  clearUpdateError: clearUpdateErrorAction,
  removeItem: removeShoppingListItemAction,
  setSelectedItem: setSelectedItemAction,
  updateFailed: shoppingListUpdateErrorAction,
  updateItemRequest: updateShoppingListItemRequestAction,
  updateItemSuccess: updateShoppingListItemSuccessAction,
};
