import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/services/auth-guard.service';
import { SharedModule } from '../shared/shared.module';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';
import { RecipeItemComponent } from './recipe-list/recipe-item/recipe-item.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipesComponent } from './recipes.component';
import { RecipesResolverService } from './services/recipes-resolver.service';

/**
 * Routes for the recipes module
 */
const recipeRoutes: Routes = [
  {
    path: '',
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
];

/**
 * Recipes Module definition.
 */
@NgModule({
  declarations: [
    RecipesComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeEditComponent,
    RecipeItemComponent,
  ],
  imports: [
    // Module imports
    RouterModule.forChild(recipeRoutes),
    SharedModule,
    ReactiveFormsModule,
  ],
  exports: [RouterModule],
})
export class RecipesModule {}
