import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Recipe } from './models/recipe.model';
import { RecipeService } from './services/recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css'],
})
export class RecipesComponent implements OnInit, OnDestroy {
  openedRecipe?: Recipe;
  recipeSelectionSubscription?: Subscription;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeSelectionSubscription = this.recipeService.subscribeOnSelect(
      (recipe) => (this.openedRecipe = recipe)
    );
  }

  ngOnDestroy(): void {
    this.recipeSelectionSubscription?.unsubscribe();
  }
}
