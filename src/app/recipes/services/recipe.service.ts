import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { IngredientService } from '../../shared/services/ingredient.service';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  recipesChanged = new EventEmitter<Recipe[]>();
  private recipeSelected = new EventEmitter<Recipe>();
  private selectedRecipe?: Recipe;
  private recipes: Recipe[] = [];

  constructor(private ingredientService: IngredientService) {
    this.addSampleData();
  }

  addRecipe(
    name: string,
    description: string,
    imagePath: string = 'https://cdn-icons-png.flaticon.com/512/3565/3565418.png'
  ): Recipe {
    const recipe = new Recipe(
      this.recipes.length + 1,
      name,
      description,
      imagePath
    );

    this.recipes.push(recipe);
    this.recipesChanged.emit([...this.recipes]);

    return recipe;
  }

  getRecipes() {
    return [...this.recipes];
  }

  setSelectedRecipe(recipe?: Recipe) {
    this.selectedRecipe = { ...recipe } as Recipe;
    if (recipe) {
      this.recipeSelected.emit({ ...recipe } as Recipe);
    } else {
      this.recipeSelected.emit(undefined);
    }
  }

  selectRecipeById(id: number) {
    if (this.selectedRecipe?.id === id) {
      console.log('recipe ', id, 'already selected');
      return;
    }

    const match = this.recipes.find((it) => it.id === id);
    return this.setSelectedRecipe(match);
  }

  save(recipe: Recipe): Recipe {
    if (recipe.id === null) {
      throw Error('Save operation is not supported for new recipes');
    }

    const match = this.recipes.find((it) => it.id === recipe.id);
    if (!match) {
      throw Error('Invalid input recipe identifier #' + recipe.id);
    }

    match.name = recipe.name;
    match.description = recipe.description;

    // note: select to allow updating selected value on different components
    this.setSelectedRecipe(match);
    return { ...match } as Recipe;
  }

  getSelectedRecipe() {
    return { ...this.selectedRecipe } as Recipe;
  }

  subscribeOnSelect(onChange: (newValue?: Recipe) => void): Subscription {
    return this.recipeSelected.subscribe(onChange);
  }

  /* Helper Methods */

  private getIngredient(ingredientName: string): Ingredient {
    return this.ingredientService.getOrAddIngredient(ingredientName);
  }

  private addSampleData() {
    this.addRecipe(
      'A burger',
      'Sample recipe of a burger',
      'https://upload.wikimedia.org/wikipedia/commons/f/fb/Burger-King-Bacon-Cheeseburger.jpg'
    )
      .addIngredient(this.getIngredient('bun'), 1)
      .addIngredient(this.getIngredient('cheese slice'), 1)
      .addIngredient(this.getIngredient('beef steak'), 1)
      .addIngredient(this.getIngredient('pickles'), 2)
      .addIngredient(this.getIngredient('tomato slices'), 2)
      .addIngredient(this.getIngredient('green salad slice'), 1);

    this.addRecipe(
      'Mac & Cheese',
      'Sample recipe of mac and cheese',
      'https://upload.wikimedia.org/wikipedia/commons/4/44/Original_Mac_n_Cheese_.jpg'
    )
      .addIngredient(
        this.getIngredient('macaroni (elbow pasta)'),
        250.0,
        RecipeUnit.GRAMS,
        'macaroni'
      )
      .addIngredient(
        this.getIngredient('unsalted butter'),
        15,
        RecipeUnit.GRAMS,
        'macaroni'
      )
      .addIngredient(
        this.getIngredient('panko breadcrumbs'),
        11,
        RecipeUnit.CUP,
        'topping'
      )
      .addIngredient(
        this.getIngredient('unsalted butter'),
        30,
        RecipeUnit.GRAMS,
        'topping'
      )
      .addIngredient(
        this.getIngredient('salt'),
        0.25,
        RecipeUnit.TEA_SPOON,
        'topping'
      )
      .addIngredient(
        this.getIngredient('unsalted butter'),
        60,
        RecipeUnit.GRAMS,
        'sauce'
      )
      .addIngredient(this.getIngredient('flour'), 0.33, RecipeUnit.CUP, 'sauce')
      .addIngredient(this.getIngredient('milk'), 3, RecipeUnit.CUP, 'sauce')
      .addIngredient(
        this.getIngredient('freshly shredded cheese'),
        2,
        RecipeUnit.CUP,
        'sauce'
      )
      .addIngredient(
        this.getIngredient('freshly shredded mozzarella cheese'),
        1,
        RecipeUnit.CUP,
        'sauce'
      )
      .addIngredient(
        this.getIngredient('salt'),
        0.75,
        RecipeUnit.TEA_SPOON,
        'topping'
      )
      .addIngredient(
        this.getIngredient('garlic powder'),
        1,
        RecipeUnit.TEA_SPOON,
        'seasonings (optional)'
      )
      .addIngredient(
        this.getIngredient('onion powder'),
        0.5,
        RecipeUnit.TEA_SPOON,
        'seasonings (optional)'
      )
      .addIngredient(
        this.getIngredient('mustard powder'),
        0.5,
        RecipeUnit.TEA_SPOON,
        'seasonings (optional)'
      );
  }
}
