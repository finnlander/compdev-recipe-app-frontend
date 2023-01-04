import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faPen, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { RoutePath } from '../../app-routing.module';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../../shared/models/confirmation.types';
import { ModalService } from '../../shared/services/modal.service';
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
  iconDelete = faTrashCan;
  iconShop = faPlus;

  selectedRecipe?: Recipe;
  dropdownOpen: boolean = false;
  RecipeRootView = RoutePath.Recipe;

  constructor(
    route: ActivatedRoute,
    private shoppingListService: ShoppingListService,
    private recipeService: RecipeService,
    private router: Router,
    private modalService: ModalService
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

    const recipe = this.selectedRecipe;
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${recipe.name}" recipe`,
      onConfirmationResult: (res) => {
        if (res == ConfirmationResult.YES) {
          this.recipeService.delete(recipe.id);
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      },
    });
  }
}
