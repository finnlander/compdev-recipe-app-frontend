import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/services/auth-guard.service';
import {
  ErrorPageComponent,
  ErrorPageData,
} from './error-page/error-page.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { RecipesComponent } from './recipes/recipes.component';
import { RecipesResolverService } from './recipes/services/recipes-resolver.service';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';

/**
 * All named views.
 */
enum Views {
  Auth = 'auth',
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
  Auth: `/${Views.Auth}`,
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
  { path: Views.Auth, component: AuthComponent },
  {
    path: Views.Recipe,
    component: RecipesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'new',
        component: RecipeEditComponent,
      },
      {
        path: ':id',
        component: RecipeDetailComponent,
        resolve: [RecipesResolverService],
      },
      {
        path: ':id/edit',
        component: RecipeEditComponent,
        resolve: [RecipesResolverService],
      },
    ],
  },
  {
    path: Views.ShoppingList,
    component: ShoppingListComponent,
    canActivate: [AuthGuard],
  },
  { path: Views.Error, component: ErrorPageComponent },
  {
    path: Views.NotFound,
    component: ErrorPageComponent,
    data: { errorMessage: 'Page not found' } as ErrorPageData,
  },
  /* Default route */
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
