import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RoutePath } from '../../app-routing.module';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import {
  ItemData,
  ShoppingListService,
} from '../../shopping-list/services/shopping-list.service';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent extends IdPathTrackingComponent {
  iconEdit = faPen;
  iconDelete = faTrash;
  iconShop = faPlus;

  selectedRecipe?: Recipe;
  dropdownOpen: boolean = false;
  RecipeRootView = RoutePath.Recipe;

  constructor(
    route: ActivatedRoute,
    private shoppingListService: ShoppingListService,
    private recipeService: RecipeService,
    private router: Router
  ) {
    super(route);
  }

  onCurrentIdChanged(currentId: number | undefined): void {
    if (currentId === this.selectedRecipe?.id) {
      return;
    }

    const selectedRecipe = currentId
      ? this.recipeService.getRecipeById(currentId)
      : undefined;

    if (!selectedRecipe) {
      console.warn(
        'Selected non-existing recipe #' +
          currentId +
          ' -> navigating to parent path'
      );
      this.router.navigate(['../'], { relativeTo: this.route });
    }

    this.selectedRecipe = selectedRecipe;
  }

  addToShoppingList() {
    const shoppingItemData: ItemData[] = this.selectedRecipe!!.items.map(
      (item) => {
        return {
          ingredientName: item.ingredient.name,
          amount: item.amount,
          unit: item.unit,
        };
      }
    );

    this.shoppingListService.addNewItems(shoppingItemData);
  }

  deleteRecipe() {
    if (!this.selectedRecipe) {
      return;
    }

    if (
      confirm(
        'Are you sure to delete the recipe "' + this.selectedRecipe?.name + '"?'
      )
    ) {
      this.recipeService.delete(this.selectedRecipe.id);
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
