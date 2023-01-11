import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import {
  DEFAULT_HOME_ROUTE_PATH,
  RoutePath,
  Views,
} from './config/routes.config';
import {
  ErrorPageComponent,
  ErrorPageData,
} from './error-page/error-page.component';

/**
 * All app module route configurations.
 */
const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_HOME_ROUTE_PATH },
  {
    path: Views.Auth,
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: Views.Recipes,
    loadChildren: () =>
      import('./recipes/recipes.module').then((m) => m.RecipesModule),
  },
  {
    path: Views.ShoppingList,
    loadChildren: () =>
      import('./shopping-list/shopping-list.module').then(
        (m) => m.ShoppingListModule
      ),
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
  imports: [
    RouterModule.forRoot(appRoutes, { preloadingStrategy: NoPreloading }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
