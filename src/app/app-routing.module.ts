import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ErrorPageComponent,
  ErrorPageData,
} from './error-page/error-page.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { RecipesComponent } from './recipes/recipes.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';

/**
 * All named views.
 */
enum Views {
  ShoppingList = 'shopping-list',
  Recipe = 'recipe',
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
  Recipe: `/${Views.Recipe}`,
  ShoppingList: `/${Views.ShoppingList}`,
  Error: `/${Views.Error}`,
  NotFound: `/${Views.NotFound}`,
};

/**
 * Landing page definition.
 */
const DEFAULT_HOME_ROUTE_PATH = RoutePath.Recipe;

/**
 * All app module route configurations.
 */
const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_HOME_ROUTE_PATH },
  {
    path: Views.Recipe,
    component: RecipesComponent,
    children: [
      {
        path: 'new',
        component: RecipeEditComponent,
      },
      { path: ':id', component: RecipeDetailComponent },
      {
        path: ':id/edit',
        component: RecipeEditComponent,
      },
    ],
  },
  { path: Views.ShoppingList, component: ShoppingListComponent },
  { path: Views.Error, component: ErrorPageComponent },
  {
    path: Views.NotFound,
    component: ErrorPageComponent,
    data: { errorMessage: 'Page not found' } as ErrorPageData,
  },
  {
    path: '**',
    redirectTo: RoutePath.NotFound,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
