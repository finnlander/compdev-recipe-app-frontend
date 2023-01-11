import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/services/auth-guard.service';
import { Views } from '../config/routes.config';
import { SharedModule } from '../shared/shared.module';
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';
import { ShoppingListItemComponent } from './shopping-list-item/shopping-list-item.component';
import { ShoppingListComponent } from './shopping-list.component';

/**
 * Routes for the shopping list module
 */
const shoppingListRoutes: Routes = [
  {
    path: Views.ShoppingList,
    component: ShoppingListComponent,
    canActivate: [AuthGuard],
  },
];

/**
 * Shopping list module definition.
 */
@NgModule({
  declarations: [
    ShoppingListComponent,
    ShoppingEditComponent,
    ShoppingListItemComponent,
  ],
  imports: [
    // Module imports
    RouterModule.forChild(shoppingListRoutes),
    SharedModule,
    FormsModule,
  ],
  exports: [RouterModule],
})
export class ShoppingListModule {}
