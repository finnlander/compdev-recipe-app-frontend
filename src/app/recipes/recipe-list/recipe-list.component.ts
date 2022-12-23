import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RoutePath } from '../../app-routing.module';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  selectedRecipe?: Recipe;
  recipes: Recipe[] = [];
  subscriptions: Subscription[] = [];
  RecipeRootPath = RoutePath.Recipe;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipes = this.recipeService.getRecipes();
    this.subscriptions.push(
      this.recipeService.subscribeOnSelect(
        (value) => (this.selectedRecipe = value)
      )
    );
    this.subscriptions.push(
      this.recipeService.recipesChanged.subscribe(
        (recipes) => (this.recipes = recipes)
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((it) => it.unsubscribe());
    this.subscriptions = [];
  }

  private loadRecipe(id: number) {
    this.recipeService.getRecipes;
  }
}
