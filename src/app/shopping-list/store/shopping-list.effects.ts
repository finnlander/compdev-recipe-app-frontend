import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { shoppingListActions, ShoppingListActionTypes } from '.';
import { IngredientService } from '../../shared/services/ingredient.service';

@Injectable()
export class ShoppingListEffects {
  constructor(
    private readonly actions$: Actions,
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
}
