/* Route configurations */

/**
 * All named views.
 */
export enum Views {
  Auth = 'auth',
  ShoppingList = 'shopping-list',
  Recipes = 'recipes',
  Error = 'error',
  NotFound = 'not-found',
}

type ValueOf<T> = T[keyof T];

export type View = ValueOf<Views>;

type RoutePaths = { [key in keyof typeof Views]: `/${string}` };

/**
 * Paths to use in route navigation to all the available target views.
 */
export const RoutePath: RoutePaths = {
  Auth: `/${Views.Auth}`,
  Recipes: `/${Views.Recipes}`,
  ShoppingList: `/${Views.ShoppingList}`,
  Error: `/${Views.Error}`,
  NotFound: `/${Views.NotFound}`,
};

/**
 * Landing page definition.
 */
export const DEFAULT_HOME_ROUTE_PATH = RoutePath.Recipes;
