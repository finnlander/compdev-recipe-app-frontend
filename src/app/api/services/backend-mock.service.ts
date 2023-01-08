import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipe } from '../../recipes/models/recipe.model';
import {
  RecipeData,
  RecipeIngredientData,
} from '../../recipes/services/recipe.service';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { User } from '../../shared/models/user.model';

interface GenericResponse {
  status: 'OK' | 'ERROR';
  error?: string;
}

interface AuthRequest {
  username: string;
  password: string;
}

type DbUser = User & {
  password: string;
};

const defaultUser: DbUser = {
  id: 1,
  username: 'testUser',
  password: 'testUser',
};

@Injectable({ providedIn: 'root' })
export class BackendMockService {
  private currentUser? = defaultUser;
  private users: DbUser[] = [defaultUser];
  private recipes: Recipe[];

  constructor() {
    // todo: generate sample data
    this.recipes = [];
  }

  getCurrentUser = (
    req: HttpRequest<any>
  ): HttpResponse<User | GenericResponse> => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      this.currentUser = undefined;
      return new HttpResponse({
        status: 404,
        body: { status: 'ERROR', error: 'NOT FOUND' },
      });
    }

    return new HttpResponse({ status: 200, body: this.currentUser });
  };

  login = (
    req: HttpRequest<AuthRequest>
  ): HttpResponse<User | GenericResponse> => {
    const match = this.users.find((it) => it.username === req.body?.username);
    if (!match || match.password !== req.body?.password) {
      return new HttpResponse({
        status: 403,
        body: { status: 'ERROR', error: "invalid 'username' or 'password'" },
      });
    }

    const { password, ...resp } = match;
    return new HttpResponse({ status: 200, body: resp });
  };

  signup = (
    req: HttpRequest<AuthRequest>
  ): HttpResponse<User | GenericResponse> => {
    const { username, password } = req.body!!;
    const match = this.users.find((it) => it.username === username);

    if (match) {
      return new HttpResponse({
        status: 409,
        body: {
          status: 'ERROR',
          error: "'username' already exists",
        },
      });
    }

    const newUser = {
      id: this.users.length + 1,
      username,
      password,
    };

    this.users.push(newUser);

    return new HttpResponse({
      status: 200,
      body: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  };

  getRecipes = (req: HttpRequest<any>): HttpResponse<Recipe[] | undefined> => {
    if (!this.isAuthorized(req)) {
      return new HttpResponse({ status: 401 });
    }

    return new HttpResponse({ status: 200, body: this.recipes });
  };
  setRecipes = (req: HttpRequest<Recipe[]>): HttpResponse<GenericResponse> => {
    if (!this.isAuthorized(req)) {
      return new HttpResponse({ status: 401 });
    }

    this.recipes = req.body || [];
    return new HttpResponse({ status: 200, body: { status: 'OK' } });
  };

  private isAuthorized(req: HttpRequest<any>): boolean {
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      return true;
    } else {
      return false;
    }
  }
}

/* Helper Functions */

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
