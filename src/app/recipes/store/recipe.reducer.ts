import {
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';

import { recipeActions as actions } from '.';
import { Recipe } from '../models/recipe.model';
/**
 * Recipes feature state.
 */
export interface RecipeState {
  /**
   * Current items in shopping list.
   */
  items: Recipe[];
  /**
   * Currently selected recipe ('null' if none is selected).
   */
  selectedItem: Recipe | null;

  /**
   * Flag indicating if some change operation is currently ongoing.
   */
  loading: boolean;
  /**
   * Error occurred with latest login or update operation.
   */
  error: string | null;
}

export const initialRecipeState: Readonly<RecipeState> = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

/**
 * Recipes state reducer.
 */
export const recipeReducer = createReducer(
  initialRecipeState,
  on(actions.clearError, (state) => ({
    ...state,
    error: null,
  })),
  on(
    actions.fetchRecipesRequest,
    actions.storeRecipesRequest,
    actions.addRecipeRequest,
    actions.updateRecipeRequest,
    (state) => ({
      ...state,
      loading: true,
      error: null,
    })
  ),
  on(actions.fetchRecipesSuccess, (state, { items }) => ({
    ...state,
    loading: false,
    error: null,
    items,
    selectedItem: state.selectedItem
      ? items.find((it) => it.id === state.selectedItem?.id) || null
      : null,
  })),
  on(actions.recipesError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(actions.setSelectedRecipe, (state, { id }) => ({
    ...state,
    selectedItem: id ? state.items.find((it) => it.id === id) || null : null,
  })),
  on(actions.deleteRecipe, (state, { id }) => ({
    ...state,
    items: state.items.filter((it) => it.id !== id),
    selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
  })),
  on(actions.storeRecipesSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(actions.addRecipeSuccess, (state, recipe) => ({
    ...state,
    loading: false,
    error: null,
    items: [...state.items, recipe],
  })),
  on(actions.updateRecipeSuccess, (state, recipe) => ({
    ...state,
    loading: false,
    error: null,
    items: state.items.map((it) => (it.id === recipe.id ? recipe : it)),
  }))
);

/* Prepared selectors */

const getRecipeStateSelector = createFeatureSelector<RecipeState>('recipes');

const isLoadingSelector = createSelector(
  getRecipeStateSelector,
  (state) => state.loading
);

const getRecipesSelector = createSelector(
  getRecipeStateSelector,
  (state) => state.items
);

const getErrorSelector = createSelector(
  getRecipeStateSelector,
  (state) => state.error
);

const getSelectedRecipeSelector = createSelector(
  getRecipeStateSelector,
  (state) => state.selectedItem
);

const getLoadingAndErrorSelector = createSelector(
  getRecipeStateSelector,
  (state) => ({
    loading: state.loading,
    error: state.error,
  })
);
/**
 * Prepared ngrx selectors for recipes state values.
 */
export const recipeSelectors = {
  isLoading: isLoadingSelector,
  getRecipes: getRecipesSelector,
  getError: getErrorSelector,
  getSelectedRecipe: getSelectedRecipeSelector,
  getLoadingAndError: getLoadingAndErrorSelector,
};
