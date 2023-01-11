import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { Views } from '../config/routes.config';
import { SharedModule } from '../shared/shared.module';
import { AuthComponent } from './auth.component';

/**
 * Routes for the authentication module
 */
const authRoutes: Routes = [{ path: Views.Auth, component: AuthComponent }];

/**
 * Authentication module definition.
 */
@NgModule({
  declarations: [AuthComponent],
  imports: [
    // Module imports
    RouterModule.forChild(authRoutes),
    SharedModule,
    FormsModule,
  ],
  exports: [RouterModule],
})
export class AuthModule {}
