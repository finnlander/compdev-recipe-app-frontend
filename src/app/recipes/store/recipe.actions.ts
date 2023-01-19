import { createAction, props } from '@ngrx/store';

import {
  ErrorContainer,
  ItemsContainer,
  PayloadWithId,
} from '../../shared/models/payloads.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { Recipe } from '../models/recipe.model';

/* Types */

export enum RecipeActionTypes {
  ADD_RECIPE_REQUEST = '[Recipes] Add recipe request',
  ADD_RECIPE_SUCCESS = '[Recipes] Add recipe success',
  CLEAR_ERROR = '[Recipes] Clear error',
  DELETE_RECIPE = '[Recipes] Delete recipe',
  FETCH_RECIPES_REQUEST = '[Recipes] Fetch all request',
  FETCH_RECIPES_SUCCESS = '[Recipes] Fetch success',
  RECIPES_ERROR = '[Recipes] error occurred',
  SET_SELECTED_ITEM = '[Recipes] Set selected item',
  SET_SELECTED_ITEM_BY_ID = '[Recipes] Set selected item by id',
  STORE_RECIPES_REQUEST = '[Recipes] Store all request',
  STORE_RECIPES_SUCCESS = '[Recipes] Store success',
  UPDATE_RECIPE_REQUEST = '[Recipes] Update recipe request',
  UPDATE_RECIPE_SUCCESS = '[Recipes] Update recipe success',
}

export interface AddRecipePayload {
  name: string;
  description: string;
  imageUrl: string;
  ingredientItems: RecipeIngredientPayloadItem[];
}

export interface RecipeIngredientPayloadItem {
  ingredientName: string;
  amount: number;
  unit: RecipeUnit;
  phase?: string;
}

export type UpdateRecipePayload = AddRecipePayload & PayloadWithId<string>;

type PayloadWithIdOrEmpty = PayloadWithId<string> | { id: null };

/* Actions */

/**
 * Ngrx action to request adding a single recipe.
 */
const addRecipeRequestAction = createAction(
  RecipeActionTypes.ADD_RECIPE_REQUEST,
  props<AddRecipePayload>()
);

/**
 * Ngrx action to complete adding a single recipe successfully.
 */
const addRecipeSuccessAction = createAction(
  RecipeActionTypes.ADD_RECIPE_SUCCESS,
  props<Recipe>()
);

/**
 * Ngrx action to clear any error occurred on recipe action.
 */
const clearErrorAction = createAction(RecipeActionTypes.CLEAR_ERROR);

/**
 * Ngrx action to delete specific recipe.
 */
const deleteRecipeAction = createAction(
  RecipeActionTypes.DELETE_RECIPE,
  props<PayloadWithId<string>>()
);

/**
 * Ngrx action to report error occurring on recipes action.
 */
const recipesErrorAction = createAction(
  RecipeActionTypes.RECIPES_ERROR,
  props<ErrorContainer>()
);

/**
 * Ngrx action to request fetching all recipes.
 */
const fetchRecipesRequestAction = createAction(
  RecipeActionTypes.FETCH_RECIPES_REQUEST
);

/**
 * Ngrx action to complete fetching all recipes successfully.
 */
const fetchRecipesSuccessAction = createAction(
  RecipeActionTypes.FETCH_RECIPES_SUCCESS,
  props<ItemsContainer<Recipe>>()
);

/**
 * Ngrx action to set selected recipe (for e.g. edit operation).
 */
const setSelectedRecipeRequestAction = createAction(
  RecipeActionTypes.SET_SELECTED_ITEM,
  props<PayloadWithIdOrEmpty>()
);

/**
 * Ngrx action to request storing all recipes.
 */
const storeRecipesRequestAction = createAction(
  RecipeActionTypes.STORE_RECIPES_REQUEST
);

/**
 * Ngrx action to complete storing all recipes successfully.
 */

const storeRecipesSuccessAction = createAction(
  RecipeActionTypes.STORE_RECIPES_SUCCESS
);

/**
 * Ngrx action to request updating a single recipe.
 */
const updateRecipeRequestAction = createAction(
  RecipeActionTypes.UPDATE_RECIPE_REQUEST,
  props<UpdateRecipePayload>()
);

/**
 * Ngrx action to complete updating a single recipe successfully.
 */
const updateRecipeSuccessAction = createAction(
  RecipeActionTypes.UPDATE_RECIPE_SUCCESS,
  props<Recipe>()
);

/**
 * Recipes related actions.
 */
export const recipeActions = {
  addRecipeRequest: addRecipeRequestAction,
  addRecipeSuccess: addRecipeSuccessAction,
  clearError: clearErrorAction,
  deleteRecipe: deleteRecipeAction,
  recipesError: recipesErrorAction,
  fetchRecipesRequest: fetchRecipesRequestAction,
  fetchRecipesSuccess: fetchRecipesSuccessAction,
  setSelectedRecipe: setSelectedRecipeRequestAction,
  storeRecipesRequest: storeRecipesRequestAction,
  storeRecipesSuccess: storeRecipesSuccessAction,
  updateRecipeRequest: updateRecipeRequestAction,
  updateRecipeSuccess: updateRecipeSuccessAction,
};
