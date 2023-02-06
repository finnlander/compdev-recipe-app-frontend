import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { RoutePath } from '../../config/routes.config';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import { ConfirmationType } from '../../shared/models/confirmation.types';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { shoppingListActions } from '../../shopping-list/store';
import { RootState } from '../../store/app.store';
import { Recipe, RecipeAdapter } from '../models/recipe.model';
import { recipeActions, recipeSelectors } from '../store';

interface ShoppingListItemData {
  ingredientName: string;
  amount: number;
  unit: RecipeUnit;
}

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent
  extends IdPathTrackingComponent
  implements OnInit, OnDestroy
{
  selectedRecipe: Recipe | null = null;
  RecipeRootView = RoutePath.Recipes;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private store: Store<RootState>
  ) {
    super(route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.addSubscription(
      this.store
        .select(recipeSelectors.getSelectedRecipe)
        .subscribe((selectedRecipe) => {
          this.selectedRecipe = selectedRecipe;
        })
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(recipeActions.setSelectedRecipe({ id: null }));
  }

  onCurrentIdChanged(currentId: Recipe['id'] | undefined): void {
    if (currentId === this.selectedRecipe?.id) {
      return;
    }

    if (currentId) {
      this.store.dispatch(recipeActions.setSelectedRecipe({ id: currentId }));
    } else {
      console.debug(
        'non-existing id value in recipe details view -> navigating away'
      );
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  addToShoppingList() {
    const recipe = this.selectedRecipe;
    if (!recipe) {
      return;
    }

    const shoppingItemData: ShoppingListItemData[] = new RecipeAdapter(
      recipe
    ).items.map((item) => {
      return {
        ingredientName: item.ingredient.name,
        amount: item.amount,
        unit: item.unit,
      };
    });

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.PROCEED_CONFIRMATION,
      itemDescription: `add ${shoppingItemData.length} ingredient(s) to the shopping list`,
      removeQuotes: true,
      onConfirmYes: () => {
        this.store.dispatch(
          shoppingListActions.addItemsRequest({
            items: shoppingItemData,
          })
        );

        this.toastService.success({
          title: 'Shopping list updated',
          message: `${shoppingItemData.length} item(s) added to the shopping list`,
        });
      },
    });
  }

  deleteRecipe() {
    const selectedRecipe = this.selectedRecipe;
    if (!selectedRecipe) {
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${selectedRecipe.name}" recipe`,
      removeQuotes: true,
      onConfirmYes: () => {
        this.store.dispatch(
          recipeActions.deleteRecipe({ id: selectedRecipe.id })
        );
        this.toastService.success({
          title: 'Deleted successfully',
          message: `Recipe "${selectedRecipe.name}" deleted successfully`,
        });
      },
    });
  }
}
