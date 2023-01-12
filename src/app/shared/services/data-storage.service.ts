import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, switchMap, tap } from 'rxjs/operators';
import { RecipesApi } from '../../api/services/recipes-api.service';
import { Recipe } from '../../recipes/models/recipe.model';
import { RecipeService } from '../../recipes/services/recipe.service';
import { IngredientService } from './ingredient.service';

interface PutResponse {
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  private loadSubscription?: Observable<Recipe[]>;

  constructor(
    private recipesApi: RecipesApi,
    private recipeService: RecipeService,
    private ingredientService: IngredientService
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();

    return this.recipesApi
      .replaceAllRecipes(recipes)
      .pipe(tap((res) => console.debug('Recipes saved. Res: ', res)));
  }

  loadRecipes(forceReload: boolean = false) {
    if (this.loadSubscription && !forceReload) {
      return this.loadSubscription;
    }

    this.loadSubscription = this.ingredientService.loadIngredients().pipe(
      // note: same http call is shared between subscribers, unless reload is forced
      shareReplay(),
      switchMap((_) => this.createLoadRecipesObservable())
    );

    return this.loadSubscription;
  }

  private createLoadRecipesObservable() {
    return this.recipesApi.getAllRecipes().pipe(
      tap((recipes) => {
        console.debug('Loaded recipes:', recipes);
        this.recipeService.setRecipes(recipes);
      })
    );
  }
}
