import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { RecipesApi } from '../../api/services/recipes-api.service';
import { Ingredient } from '../../shared/models/ingredient.model';
import { IngredientService } from '../../shared/services/ingredient.service';
import { createUniqueIdString } from '../../shared/utils/common.util';
import { RootState } from '../../store/app.store';
import { Recipe, RecipeAdapter } from '../models/recipe.model';
import { AddRecipePayload, recipeActions } from './recipe.actions';
import { recipeSelectors } from './recipe.reducer';

/**
 * Authentication related effects.
 * Note: Angular effects should never throw errors as they will kill the observables that should be re-used on every
 *       dispatched action.
 */
@Injectable()
export class RecipeEffects {
  constructor(
    private readonly actions$: Actions,
    private store: Store<RootState>,
    private recipesApi: RecipesApi,
    private ingredientService: IngredientService
  ) {}

  addRecipe = createEffect(() =>
    this.actions$.pipe(
      ofType(recipeActions.addRecipeRequest),
      switchMap((payload) => {
        const ingredientNames = payload.ingredientItems.map(
          (it) => it.ingredientName
        );

        return this.ingredientService.getOrAddIngredients(ingredientNames).pipe(
          map((ingredients) =>
            recipeActions.addRecipeSuccess(
              mapToRecipe(createUniqueIdString(), payload, ingredients)
            )
          ),
          catchError((error) => {
            return of(
              recipeActions.recipesError({
                error: `Updating recipe failed on error: ${error}`,
              })
            );
          })
        );
      })
    )
  );

  updateRecipe = createEffect(() =>
    this.actions$.pipe(
      ofType(recipeActions.updateRecipeRequest),
      switchMap((payload) => {
        const ingredientNames = payload.ingredientItems.map(
          (it) => it.ingredientName
        );

        return this.ingredientService.getOrAddIngredients(ingredientNames).pipe(
          map((ingredients) =>
            recipeActions.updateRecipeSuccess(
              mapToRecipe(payload.id, payload, ingredients)
            )
          ),
          catchError((error) => {
            return of(
              recipeActions.recipesError({
                error: `Updating recipe failed on error: ${error}`,
              })
            );
          })
        );
      })
    )
  );

  fetchRecipes = createEffect(() =>
    this.actions$.pipe(
      ofType(recipeActions.fetchRecipesRequest),
      switchMap(() =>
        this.recipesApi.getAllRecipes().pipe(
          map(
            (res) =>
              res.ok
                ? recipeActions.fetchRecipesSuccess({ items: res.data })
                : recipeActions.recipesError({ error: res.error }),
            catchError((err) => {
              return of(
                recipeActions.recipesError({
                  error: `Fetching recipes failed on error: ${err}`,
                })
              );
            })
          )
        )
      )
    )
  );

  storeRecipes = createEffect(() =>
    this.actions$.pipe(
      ofType(recipeActions.storeRecipesRequest),
      withLatestFrom(this.store.select(recipeSelectors.getRecipes)),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(([_, recipes]) => recipes),
      switchMap((recipes) =>
        this.recipesApi.replaceAllRecipes(recipes).pipe(
          map(
            (res) =>
              res.ok
                ? recipeActions.storeRecipesSuccess()
                : recipeActions.recipesError({ error: res.error }),
            catchError((err) =>
              of(
                recipeActions.recipesError({
                  error: `Storing recipes failed on error: ${err}`,
                })
              )
            )
          )
        )
      )
    )
  );
}

/* Helper Functions */

function mapToRecipe(
  id: Recipe['id'],
  payload: AddRecipePayload,
  ingredients: Ingredient[]
) {
  const recipe: Recipe = {
    id,
    name: payload.name,
    description: payload.description,
    imageUrl: payload.imageUrl,
    phases: [],
  };

  const recipeAdapter = new RecipeAdapter(recipe);

  payload.ingredientItems.forEach((it) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ingredient = ingredients.find(
      (ingredient) => ingredient.name === it.ingredientName
    )!;
    recipeAdapter.addIngredient(ingredient, it.amount, it.unit, it.phase);
  });
  return recipe;
}
