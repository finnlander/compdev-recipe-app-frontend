import { Injectable } from '@angular/core';
import { clone, sortedUniq } from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { IngredientService } from '../../shared/services/ingredient.service';
import { Recipe } from '../models/recipe.model';

export const DEFAULT_RECIPE_IMG =
  'https://cdn-icons-png.flaticon.com/512/3565/3565418.png';

export interface RecipeData {
  name: string;
  description: string;
  imageUrl: string;
  ingredientItems: RecipeIngredientData[];
}

export interface RecipeIngredientData {
  ingredientName: string;
  amount: number;
  unit: RecipeUnit;
  phase?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();
  private recipeSelected = new Subject<Recipe>();
  private selectedRecipe?: Recipe;
  private recipes: Recipe[] = [];

  constructor(private ingredientService: IngredientService) {}

  addRecipe(data: RecipeData): Observable<Recipe> {
    const ingredientNames = extractUniqueIngredientNames(data);

    return this.ingredientService.getOrAddIngredients(ingredientNames).pipe(
      map((ingredients) => this.createNewRecipe(data, ingredients)),
      map((recipe) => {
        this.recipes.push(recipe);
        this.recipesChanged.next([...this.recipes]);
        return { ...recipe } as Recipe;
      })
    );
  }

  delete(recipeId: number) {
    const match = this.findRecipeById(recipeId, true)!!;
    const index = this.recipes.findIndex((it) => it.id === recipeId);
    if (index < 0) {
      throw Error(
        'Deletion failed: invalid input recipe identifier #' + recipeId
      );
    }

    this.recipes.splice(index, 1);
    this.recipesChanged.next([...this.recipes]);
  }

  setRecipes(recipes: Recipe[]) {
    recipes.forEach((recipe) => {
      recipe.items.forEach((it) =>
        this.ingredientService.getOrAddIngredient(it.ingredient.name)
      );
    });
    this.recipes = recipes;

    this.recipesChanged.next([...this.recipes]);
  }

  getRecipes() {
    return [...this.recipes];
  }

  getRecipeById(recipeId: number): Recipe | undefined {
    const match = this.findRecipeById(recipeId);
    if (!match) return undefined;

    return { ...match } as Recipe;
  }

  setSelectedRecipe(recipe?: Recipe) {
    this.selectedRecipe = { ...recipe } as Recipe;
    if (recipe) {
      this.recipeSelected.next({ ...recipe } as Recipe);
    } else {
      this.recipeSelected.next(undefined);
    }
  }

  selectRecipeById(id: number) {
    if (this.selectedRecipe?.id === id) {
      console.debug('recipe ', id, 'already selected');
      return;
    }

    const match = this.recipes.find((it) => it.id === id);
    return this.setSelectedRecipe(match);
  }

  update(recipeId: number, newData: RecipeData) {
    const recipe = this.findRecipeById(recipeId, true)!!;

    const ingredientNames = extractUniqueIngredientNames(newData);
    return this.ingredientService.getOrAddIngredients(ingredientNames).pipe(
      map((ingredients) =>
        this.updateExistingRecipe(recipe, newData, ingredients)
      ),
      // note: select to allow updating selected value on different components
      tap((it) => this.setSelectedRecipe(it)),
      map((it) => clone(it))
    );
  }

  getSelectedRecipe() {
    return { ...this.selectedRecipe } as Recipe;
  }

  subscribeOnSelect(onChange: (newValue?: Recipe) => void): Subscription {
    return this.recipeSelected.subscribe(onChange);
  }

  /* Helper Methods */

  private createNewRecipe(data: RecipeData, ingredients: Ingredient[]): Recipe {
    const { name, description, imageUrl, ingredientItems } = data;
    const recipe = new Recipe(
      this.recipes.length + 1,
      name,
      description,
      imageUrl
    );

    addIngredients(recipe, ingredientItems, ingredients);

    return recipe;
  }

  private updateExistingRecipe(
    recipe: Recipe,
    data: RecipeData,
    ingredients: Ingredient[]
  ): Recipe {
    const { name, description, imageUrl, ingredientItems } = data;

    recipe.name = name;
    recipe.description = description;
    recipe.imageUrl = imageUrl;

    recipe.clearItems();
    addIngredients(recipe, ingredientItems, ingredients);

    return recipe;
  }

  private findRecipeById(recipeId: number, required: boolean = false) {
    const match = this.recipes.find((it) => it.id === recipeId);

    if (!match && required) {
      throw Error('Invalid input recipe identifier #' + recipeId);
    }

    return match;
  }
}

/* Helper Functions */

function addIngredients(
  recipe: Recipe,
  ingredientItems: RecipeIngredientData[],
  ingredients: Ingredient[]
) {
  ingredientItems.forEach((ingredientItem) => {
    const ingredient = ingredients.find(
      (it) => it.name === ingredientItem.ingredientName
    )!!;
    recipe.addIngredient(
      ingredient,
      ingredientItem.amount,
      ingredientItem.unit,
      ingredientItem.phase
    );
  });
}

function extractUniqueIngredientNames(data: RecipeData) {
  return sortedUniq(data.ingredientItems.map((it) => it.ingredientName));
}
