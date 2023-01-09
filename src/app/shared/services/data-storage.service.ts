import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Recipe } from '../../recipes/models/recipe.model';
import { RecipeService } from '../../recipes/services/recipe.service';
import { getApiUrl } from '../utils/common.util';
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
    private http: HttpClient,
    private recipeService: RecipeService,
    private ingredientService: IngredientService
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    console.log('recipes:', recipes);

    const url = getApiUrl('recipes');
    return new Promise<void>((resolve, reject) => {
      this.http.put<PutResponse>(url, recipes).subscribe(
        (res) => {
          console.debug('Save response:', res);
          resolve();
        },
        (error: HttpErrorResponse) => {
          console.error('API error occurred on storing recipes: ', error);
          reject(error.message);
        }
      );
    });
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
    const url = getApiUrl('recipes');
    return this.http.get<Recipe[]>(url).pipe(
      tap((recipes) => {
        console.debug('Loaded recipes:', recipes);
        this.recipeService.setRecipes(recipes);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API error occurred on loading recipes: ', error);
        return throwError(error.message);
      })
    );
  }
}
