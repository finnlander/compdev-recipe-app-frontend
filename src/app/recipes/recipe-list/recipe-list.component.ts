import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { RoutePath } from '../../config/routes.config';
import { RootState } from '../../store/app.store';
import { Recipe } from '../models/recipe.model';
import { recipeActions, recipeSelectors } from '../store';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit {
  recipes$: Observable<Recipe[]> = of([]);
  RecipeRootPath = RoutePath.Recipes;

  constructor(private store: Store<RootState>) {}

  ngOnInit(): void {
    this.recipes$ = this.store.select(recipeSelectors.getRecipes);
  }

  deselectRecipe() {
    this.store.dispatch(recipeActions.setSelectedRecipe({ id: null }));
  }
}
