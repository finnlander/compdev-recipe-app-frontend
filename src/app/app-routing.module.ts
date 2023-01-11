import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
