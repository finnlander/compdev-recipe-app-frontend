/* Utility functions related recipes functionality */

import { Actions, ofType } from '@ngrx/effects';
import { ActionCreator } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { take, tap } from 'rxjs/operators';
import { ErrorContainer } from '../shared/models/payloads.model';
import { recipeActions, RecipeActionTypes } from './store';

/**
 * Create 'run-once' type of subscription that waits specific 'success' or 'error' actions to be triggered
 * and calls the matching callback function (to allow e.g. generating feedback).
 */
export function reactOnRecipesActionResult<T extends RecipeActionTypes, P>(
  actions$: Actions,
  params: {
    successAction: ActionCreator<T, (props: P) => TypedAction<T>>;
    onSuccess: () => void;
    onFailure: (error: string) => void;
  }
) {
  const { successAction, onSuccess, onFailure } = params;
  actions$
    .pipe(
      ofType(successAction, recipeActions.recipesError),

      tap((action) => {
        if (action.type === recipeActions.recipesError.type) {
          const payload = action as ErrorContainer;

          onFailure(payload.error);
        } else {
          onSuccess();
        }
      }),
      take(1)
    )
    .subscribe();
}
