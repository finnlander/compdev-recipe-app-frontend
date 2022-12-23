import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutePath } from '../../app-routing.module';
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
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe?: Recipe;
  dropdownOpen: boolean = false;
  private subscriptions: Subscription[] = [];
  RecipeRootView = RoutePath.Recipe;

  constructor(
    private shoppingListService: ShoppingListService,
    private recipeService: RecipeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.recipe = this.recipeService.getSelectedRecipe();

    this.subscriptions.push(
      this.recipeService.subscribeOnSelect((recipe) => (this.recipe = recipe))
    );

    const currentRecipeId = +this.route.snapshot.params['id'];
    if (currentRecipeId !== this.recipe?.id) {
      this.recipeService.selectRecipeById(currentRecipeId);
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((it) => it.unsubscribe());
    this.subscriptions = [];
  }

  addToShoppingList() {
    const shoppingItemData: ItemData[] = this.recipe!!.items.map((item) => {
      return {
        ingredientName: item.ingredient.name,
        amount: item.amount,
        unit: item.unit,
      };
    });

    this.shoppingListService.addNewItems(shoppingItemData);
  }

  deleteRecipe() {
    // TODO
  }
}
