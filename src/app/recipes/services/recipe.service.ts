import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
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

  constructor(private ingredientService: IngredientService) {
    this.addSampleData();
  }

  addRecipe(data: RecipeData): Recipe {
    const { name, description, imageUrl, ingredientItems } = data;
    const recipe = new Recipe(
      this.recipes.length + 1,
      name,
      description,
      imageUrl
    );

    ingredientItems.forEach((item) => this.addIngredientItem(recipe, item));

    this.recipes.push(recipe);
    this.recipesChanged.next([...this.recipes]);

    return { ...recipe } as Recipe;
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

  update(recipeId: number, newData: RecipeData): Recipe {
    const { name, description, imageUrl, ingredientItems } = newData;
    const match = this.findRecipeById(recipeId, true)!!;

    match.name = name;
    match.description = description;
    match.imageUrl = imageUrl;

    match.clearItems();
    ingredientItems.forEach((item) => this.addIngredientItem(match, item));

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

  private addIngredientItem(recipe: Recipe, item: RecipeIngredientData): void {
    recipe.addIngredient(
      this.getIngredient(item.ingredientName),
      item.amount,
      item.unit,
      item.phase
    );
  }

  private findRecipeById(recipeId: number, required: boolean = false) {
    const match = this.recipes.find((it) => it.id === recipeId);

    if (!match && required) {
      throw Error('Invalid input recipe identifier #' + recipeId);
    }

    return match;
  }

  private addSampleData() {
    generateSampleData().forEach((recipe) => this.addRecipe(recipe));
  }
}

function toIngredientData(
  ingredientName: string,
  amount: number,
  unit: RecipeUnit = RecipeUnit.PCS,
  phase?: string
): RecipeIngredientData {
  return {
    ingredientName,
    amount,
    unit,
    phase,
  };
}

function generateSampleData(): RecipeData[] {
  return [
    // Sample burger recipe
    {
      name: 'A Mighty Burger',
      description: 'Sample recipe of a burger',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/fb/Burger-King-Bacon-Cheeseburger.jpg',
      ingredientItems: [
        toIngredientData('bun', 1),
        toIngredientData('cheese slice', 1),
        toIngredientData('beef steak', 1),
        toIngredientData('pickles', 2),
        toIngredientData('tomato slices', 2),
        toIngredientData('green salad slice', 1),
      ],
    },
    // Sample Snitchel recipe
    {
      name: 'Wiener Schnitzel',
      description: 'A traditional german schnitzel recipe',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG',
      ingredientItems: [
        toIngredientData('Premium wieners', 4, RecipeUnit.PCS),
        toIngredientData('French fries', 0.5, RecipeUnit.KG),
      ],
    },
    // Sample mac & cheese recipe
    {
      name: 'Traditional Mac & Cheese',
      description: 'Sample recipe of mac and cheese',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/4/44/Original_Mac_n_Cheese_.jpg',
      ingredientItems: [
        // macaroni
        toIngredientData(
          'macaroni (elbow pasta)',
          250,
          RecipeUnit.GRAMS,
          'macaroni'
        ),
        toIngredientData('unsalted butter', 15, RecipeUnit.GRAMS, 'macaroni'),
        // topping
        toIngredientData('panko breadcrumbs', 11, RecipeUnit.CUP, 'topping'),
        toIngredientData('unsalted butter', 30, RecipeUnit.GRAMS, 'topping'),
        toIngredientData('salt', 0.25, RecipeUnit.TEA_SPOON, 'topping'),
        // sauce
        toIngredientData('unsalted butter', 60, RecipeUnit.GRAMS, 'sauce'),
        toIngredientData('flour', 0.33, RecipeUnit.CUP, 'sauce'),
        toIngredientData('milk', 3, RecipeUnit.CUP, 'sauce'),
        toIngredientData('freshly shredded cheese', 2, RecipeUnit.CUP, 'sauce'),
        toIngredientData(
          'freshly shredded mozzarella cheese',
          1,
          RecipeUnit.CUP,
          'sauce'
        ),
        toIngredientData('salt', 0.75, RecipeUnit.TEA_SPOON, 'sauce'),
        // Seasonings
        toIngredientData(
          'garlic powder',
          1,
          RecipeUnit.TEA_SPOON,
          'seasonings (optional)'
        ),
        toIngredientData(
          'onion powder',
          0.5,
          RecipeUnit.TEA_SPOON,
          'seasonings (optional)'
        ),
        toIngredientData(
          'mustard powder',
          0.5,
          RecipeUnit.TEA_SPOON,
          'seasonings (optional)'
        ),
      ],
    },
  ];
}
