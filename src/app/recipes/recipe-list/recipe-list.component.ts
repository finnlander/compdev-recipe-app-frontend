import { Component, OnInit } from '@angular/core';
import { RoutePath } from '../../app-routing.module';
import { SubscribingComponent } from '../../shared/classes/subscribing-component';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent
  extends SubscribingComponent
  implements OnInit
{
  selectedRecipe?: Recipe;
  recipes: Recipe[] = [];
  RecipeRootPath = RoutePath.Recipes;

  constructor(private recipeService: RecipeService) {
    super();
  }

  ngOnInit(): void {
    this.recipes = this.recipeService.getRecipes();
    this.addSubscription(
      this.recipeService.subscribeOnSelect(
        (value) => (this.selectedRecipe = value)
      )
    );
    this.addSubscription(
      this.recipeService.recipesChanged.subscribe(
        (recipes) => (this.recipes = recipes)
      )
    );
  }

  deselectRecipe() {
    this.recipeService.setSelectedRecipe();
  }
}
