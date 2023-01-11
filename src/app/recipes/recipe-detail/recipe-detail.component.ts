import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faPen, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { RoutePath } from '../../config/routes.config';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import { ConfirmationType } from '../../shared/models/confirmation.types';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
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
  RecipeRootView = RoutePath.Recipes;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private shoppingListService: ShoppingListService,
    private recipeService: RecipeService,
    private modalService: ModalService,
    private toastService: ToastService
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

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.PROCEED_CONFIRMATION,
      itemDescription: `add ${shoppingItemData.length} ingredient(s) to the shopping list`,
      removeQuotes: true,
      onConfirmYes: () => {
        this.shoppingListService.addNewItems(shoppingItemData);
        this.toastService.success({
          title: 'Shopping list updated',
          message: `${shoppingItemData.length} item(s) added to the shopping list`,
        });
      },
    });
  }

  deleteRecipe() {
    if (!this.selectedRecipe) {
      return;
    }

    const recipe = this.selectedRecipe;
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${recipe.name}" recipe`,
      removeQuotes: true,
      onConfirmYes: () => {
        this.recipeService.delete(recipe.id);
        this.toastService.success({
          title: 'Deleted successfully',
          message: `Recipe "${recipe.name}" deleted successfully`,
        });

        this.router.navigate(['../'], { relativeTo: this.route });
      },
    });
  }
}
