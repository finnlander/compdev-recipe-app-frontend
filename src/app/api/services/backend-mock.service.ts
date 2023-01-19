import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Recipe, RecipeAdapter } from '../../recipes/models/recipe.model';
import {
  AddRecipePayload,
  RecipeIngredientPayloadItem,
} from '../../recipes/store';
import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { User } from '../../shared/models/user.model';
import { createUniqueIdString } from '../../shared/utils/common.util';
import {
  AccessToken,
  AuthRequest,
  AuthResponse,
} from '../model/authentication.model';
import { GenericResponse } from '../model/generic-response.model';

const STORAGE_KEY_BACKEND_STATE = '_backendMockState';

type DbUser = User & {
  password: string;
};

interface BackendState {
  users: DbUser[];
  recipes: Recipe[];
  ingredients: Ingredient[];
}

const defaultUser: DbUser = {
  id: 1,
  username: 'testUser',
  password: 'testUser',
};

let initialState: BackendState;
{
  const recipes: Recipe[] = [];
  const ingredients: Ingredient[] = [];
  if (environment.generateSampleData) {
    initSampleData(recipes, ingredients);
  }
  initialState = {
    users: [defaultUser],
    recipes: recipes,
    ingredients: ingredients,
  };
}

/**
 * Service that acts as a mock for the backend server.
 */
@Injectable({ providedIn: 'root' })
export class BackendMockService {
  private currentUser? = defaultUser;
  private state: BackendState = initialState;

  constructor() {
    // todo: generate sample data
    this.tryResumeExistingState();
  }

  getCurrentUser = (
    req: HttpRequest<any>
  ): HttpResponse<User | GenericResponse> => {
    if (!this.isAuthorized(req)) {
      return createUnauthorizedResponse();
    }

    const authHeader = req.headers.get('Authorization');
    const token = decodeMockAuthToken(authHeader);

    if (!token || !this.currentUser) {
      this.currentUser = undefined;
      return new HttpResponse({
        status: 404,
        body: { status: 'ERROR', error: 'NOT FOUND' },
      });
    }

    if (token.username !== this.currentUser.username) {
      return new HttpResponse({
        status: 403,
        body: { status: 'ERROR', error: 'FORBIDDEN' },
      });
    }

    return new HttpResponse({ status: 200, body: this.currentUser });
  };

  login = (
    req: HttpRequest<AuthRequest>
  ): HttpResponse<AuthResponse | GenericResponse> => {
    const match = this.state.users.find(
      (it) => it.username === req.body?.username
    );
    if (!match || match.password !== req.body?.password) {
      return new HttpResponse({
        status: 403,
        body: { status: 'ERROR', error: "invalid 'username' or 'password'" },
      });
    }

    const token = encodeMockAuthToken(match);
    const { password, ...resp } = match;
    return new HttpResponse({
      status: 200,
      body: {
        token,
      },
    });
  };

  signup = (
    req: HttpRequest<AuthRequest>
  ): HttpResponse<AuthResponse | GenericResponse> => {
    const { username, password } = req.body!!;
    const match = this.state.users.find((it) => it.username === username);

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
      id: this.state.users.length + 1,
      username,
      password,
    };

    this.state.users.push(newUser);
    this.storeState();

    const token = encodeMockAuthToken(newUser);
    return new HttpResponse({
      status: 200,
      body: {
        token,
      },
    });
  };

  getRecipes = (
    req: HttpRequest<any>
  ): HttpResponse<Recipe[] | GenericResponse> => {
    if (!this.isAuthorized(req)) {
      return createUnauthorizedResponse();
    }

    return new HttpResponse({ status: 200, body: [...this.state.recipes] });
  };
  setRecipes = (req: HttpRequest<Recipe[]>): HttpResponse<GenericResponse> => {
    if (!this.isAuthorized(req)) {
      return createUnauthorizedResponse();
    }

    this.state.recipes = req.body || [];
    this.storeState();

    return new HttpResponse({ status: 200, body: { status: 'OK' } });
  };

  getIngredients = (
    req: HttpRequest<any>
  ): HttpResponse<Ingredient[] | GenericResponse> => {
    if (!this.isAuthorized(req)) {
      return createUnauthorizedResponse();
    }

    return new HttpResponse({ status: 200, body: [...this.state.ingredients] });
  };

  getOrAddIngredients = (
    req: HttpRequest<{ ingredientNames: string[] }>
  ): HttpResponse<Ingredient[] | GenericResponse> => {
    if (!this.isAuthorized(req)) {
      return createUnauthorizedResponse();
    }

    const ingredients = req.body!!.ingredientNames.map((ingredientName) =>
      this.getOrAddIngredient(ingredientName)
    );

    return new HttpResponse({ status: 200, body: [...ingredients] });
  };

  /* Helper Methods */

  private isAuthorized(req: HttpRequest<any>): boolean {
    const authHeader = req.headers.get('Authorization');
    const token = decodeMockAuthToken(authHeader);

    if (token) {
      return true;
    } else {
      console.log('authorization failed for header: ', authHeader);
      return false;
    }
  }

  private getOrAddIngredient(ingredientName: string): Ingredient {
    const existingIngredient = this.state.ingredients.find(
      (it) => it.name === ingredientName
    );

    if (existingIngredient) {
      return existingIngredient;
    }

    const ingredientId = this.state.ingredients.length + 1;
    const newIngredient: Ingredient = {
      id: ingredientId,
      name: ingredientName,
    };
    this.state.ingredients.push(newIngredient);
    this.storeState();

    return newIngredient;
  }

  private storeState() {
    try {
      const json = JSON.stringify(this.state);
      localStorage.setItem(STORAGE_KEY_BACKEND_STATE, json);
    } catch (err) {
      console.log('failed to store mock backend state:', err);
    }
  }

  private tryResumeExistingState() {
    const existingState = localStorage.getItem(STORAGE_KEY_BACKEND_STATE);
    if (existingState) {
      try {
        const state = JSON.parse(existingState);
        this.state = state;
      } catch (error) {}
    }
  }
}

/* Helper Functions */

export function decodeMockAuthToken(
  token: string | undefined | null
): AccessToken | undefined {
  if (!token) {
    return undefined;
  }

  try {
    const authToken = token.startsWith('Bearer') ? token.split(' ')[1] : token;
    const decodedToken = atob(authToken);

    if (!decodedToken) {
      return undefined;
    }

    return JSON.parse(decodedToken) as AccessToken;
  } catch (error) {
    return undefined;
  }
}

function encodeMockAuthToken(user: User): string {
  const token: AccessToken = {
    id: user.id,
    username: user.username,
    exp: Math.round(new Date().getTime() / 1000) + 3600,
    sub: 'recipe-app',
    aud: `${environment.backendServerBaseUrl}`,
    iss: 'backend-mock',
  };

  const tokenJson = JSON.stringify(token);
  try {
    return btoa(tokenJson);
  } catch (error) {
    console.error('failed to encode mock access token');
    return '';
  }
}

function createUnauthorizedResponse(): HttpResponse<GenericResponse> {
  return new HttpResponse({
    status: 401,
    body: { status: 'ERROR', error: 'UNAUTHORIZED' },
  });
}

function initSampleData(recipes: Recipe[], ingredients: Ingredient[]) {
  const recipesData = generateSampleSourceData();

  recipesData.forEach(({ name, description, imageUrl, ingredientItems }) => {
    const id = createUniqueIdString();
    const recipe: Recipe = {
      id,
      name,
      description,
      imageUrl,
      phases: [],
    };

    const recipeAdapter = new RecipeAdapter(recipe);

    ingredientItems.forEach((item) => {
      const { ingredientName, amount, unit, phase } = item;

      let existingIngredient = ingredients.find(
        (it) => it.name === ingredientName
      );

      if (!existingIngredient) {
        existingIngredient = {
          id: ingredients.length + 1,
          name: ingredientName,
        };
        ingredients.push(existingIngredient);
      }

      recipeAdapter.addIngredient(existingIngredient, amount, unit, phase);
    });

    recipes.push(recipe);
  });

  return {
    recipes,
    ingredients,
  };
}

function generateSampleSourceData(): AddRecipePayload[] {
  return [
    // Sample burger recipe
    {
      name: 'A Mighty Burger',
      description: 'Sample recipe of a burger',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/fb/Burger-King-Bacon-Cheeseburger.jpg',
      ingredientItems: [
        toIngredientPayload('bun', 1),
        toIngredientPayload('cheese slice', 1),
        toIngredientPayload('beef steak', 1),
        toIngredientPayload('pickles', 2),
        toIngredientPayload('tomato slices', 2),
        toIngredientPayload('green salad slice', 1),
      ],
    },
    // Sample Snitchel recipe
    {
      name: 'Wiener Schnitzel',
      description: 'A traditional german schnitzel recipe',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG',
      ingredientItems: [
        toIngredientPayload('Premium wieners', 4, RecipeUnit.PCS),
        toIngredientPayload('French fries', 0.5, RecipeUnit.KG),
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
        toIngredientPayload(
          'macaroni (elbow pasta)',
          250,
          RecipeUnit.GRAMS,
          'macaroni'
        ),
        toIngredientPayload(
          'unsalted butter',
          15,
          RecipeUnit.GRAMS,
          'macaroni'
        ),
        // topping
        toIngredientPayload('panko breadcrumbs', 11, RecipeUnit.CUP, 'topping'),
        toIngredientPayload('unsalted butter', 30, RecipeUnit.GRAMS, 'topping'),
        toIngredientPayload('salt', 0.25, RecipeUnit.TEA_SPOON, 'topping'),
        // sauce
        toIngredientPayload('unsalted butter', 60, RecipeUnit.GRAMS, 'sauce'),
        toIngredientPayload('flour', 0.33, RecipeUnit.CUP, 'sauce'),
        toIngredientPayload('milk', 3, RecipeUnit.CUP, 'sauce'),
        toIngredientPayload(
          'freshly shredded cheese',
          2,
          RecipeUnit.CUP,
          'sauce'
        ),
        toIngredientPayload(
          'freshly shredded mozzarella cheese',
          1,
          RecipeUnit.CUP,
          'sauce'
        ),
        toIngredientPayload('salt', 0.75, RecipeUnit.TEA_SPOON, 'sauce'),
        // Seasonings
        toIngredientPayload(
          'garlic powder',
          1,
          RecipeUnit.TEA_SPOON,
          'seasonings (optional)'
        ),
        toIngredientPayload(
          'onion powder',
          0.5,
          RecipeUnit.TEA_SPOON,
          'seasonings (optional)'
        ),
        toIngredientPayload(
          'mustard powder',
          0.5,
          RecipeUnit.TEA_SPOON,
          'seasonings (optional)'
        ),
      ],
    },
  ];
}

function toIngredientPayload(
  ingredientName: string,
  amount: number,
  unit: RecipeUnit = RecipeUnit.PCS,
  phase?: string
): RecipeIngredientPayloadItem {
  return {
    ingredientName,
    amount,
    unit,
    phase,
  };
}
