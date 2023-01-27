import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  shoppingListActions,
  ShoppingListActionTypes,
  shoppingListSelectors,
} from '.';
import { IngredientService } from '../../shared/services/ingredient.service';
import { RootState } from '../../store/app.store';
import { ShoppingListItem } from '../models/shopping-list-item-model';

const STORAGE_KEY_SHOPPING_LIST = 'shoppingList';

@Injectable()
export class ShoppingListEffects {
  constructor(
    private readonly actions$: Actions,
    private store: Store<RootState>,
    private ingredientService: IngredientService
  ) {}

  addOrUpdateItem = createEffect(() =>
    this.actions$.pipe(
      ofType(
        shoppingListActions.addItemRequest,
        shoppingListActions.updateItemRequest
      ),
      switchMap(({ type, ingredientName, amount, unit, ...rest }) =>
        this.ingredientService.getOrAddIngredient(ingredientName).pipe(
          map((ingredient) => {
            if (type === ShoppingListActionTypes.UPDATE_ITEM_REQUEST) {
              const ordinal = (<{ ordinal: number }>rest).ordinal;
              return shoppingListActions.updateItemSuccess({
                ordinal,
                ingredient,
                amount: amount,
                unit: unit,
              });
            } else {
              return shoppingListActions.addItemSuccess({
                ingredient,
                amount: amount,
                unit: unit,
              });
            }
          })
        )
      ),
      catchError((error: string) =>
        of(
          shoppingListActions.updateFailed({
            error: `Shopping list update failed on error: ${error}`,
          })
        )
      )
    )
  );

  addItems = createEffect(() =>
    this.actions$.pipe(
      ofType(shoppingListActions.addItemsRequest),
      switchMap(({ items }) => {
        const ingredientNames = items.map((it) => it.ingredientName);
        return this.ingredientService.getOrAddIngredients(ingredientNames).pipe(
          map((ingredients) => {
            const successItems = items.map((it) => ({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              ingredient: ingredients.find(
                (ingredient) => ingredient.name === it.ingredientName
              )!,
              amount: it.amount,
              unit: it.unit,
            }));

            return shoppingListActions.addItemsSuccess({
              items: successItems,
            });
          })
        );
      }),
      catchError((error: string) =>
        of(
          shoppingListActions.updateFailed({
            error: `Adding to shopping list operation failed on error: ${error}`,
          })
        )
      )
    )
  );

  onUpdateItems = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          shoppingListActions.addItemSuccess,
          shoppingListActions.addItemsSuccess,
          shoppingListActions.removeItem
        ),
        withLatestFrom(
          this.store.select(shoppingListSelectors.getShoppingListItems)
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map(([_, items]) => items),
        tap((items) => updateStoredShoppingList(items))
      ),
    { dispatch: false }
  );

  onClearItems = createEffect(
    () =>
      this.actions$.pipe(
        ofType(shoppingListActions.clearItems),
        tap(() => clearStoredShoppingList())
      ),
    { dispatch: false }
  );

  loadStoredItems = createEffect(() =>
    this.actions$.pipe(
      ofType(shoppingListActions.loadStoredItemsRequest),
      map(() => {
        const items = getStoredShoppingList();
        return shoppingListActions.loadStoredItemsSuccess({ items });
      })
    )
  );
}

/* Helper Functions */

function clearStoredShoppingList() {
  localStorage.removeItem(STORAGE_KEY_SHOPPING_LIST);
  console.log('Stored shopping list cleared');
}

function getStoredShoppingList(): ShoppingListItem[] {
  const data = localStorage.getItem(STORAGE_KEY_SHOPPING_LIST);
  if (!data) {
    return [];
  }

  try {
    const obj = JSON.parse(data);
    if (!Array.isArray(obj)) {
      return [];
    }

    console.debug(`Restored shopping list: ${obj.length} item(s)`);
    return obj as ShoppingListItem[];
  } catch (error) {
    console.warn('Failed to parse stored shopping list from local storage');
    return [];
  }
}

function updateStoredShoppingList(items: ShoppingListItem[]) {
  const data = JSON.stringify(items);
  localStorage.setItem(STORAGE_KEY_SHOPPING_LIST, data);
  console.debug(`Stored shopping list updated: ${items.length} item(s)`);
}
