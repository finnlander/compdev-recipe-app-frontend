import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  map,
  skipWhile,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { RootState } from '../../store/app.store';
import { Recipe } from '../models/recipe.model';
import { recipeActions, recipeSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(private store: Store<RootState>, private actions$: Actions) {}

  resolve(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _state: RouterStateSnapshot
  ): Recipe[] | Observable<Recipe[]> | Promise<Recipe[]> {
    return this.getRecipesAfterLoadingFinished().pipe(
      switchMap((recipes) => {
        if (recipes.length > 0) {
          return of(recipes);
        }

        this.store.dispatch(recipeActions.fetchRecipesRequest());
        return this.actions$.pipe(
          ofType(recipeActions.fetchRecipesSuccess),
          take(1),
          map((it) => it.items)
        );
      })
    );
  }

  /* Helper Methods */
  private getRecipesAfterLoadingFinished() {
    // delay response if recipes are currently loaded
    return this.store.select(recipeSelectors.getRecipes).pipe(
      withLatestFrom(this.store.select(recipeSelectors.isLoading)),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      skipWhile(([_, isLoading]) => isLoading),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(([recipes, _]) => recipes)
    );
  }
}
