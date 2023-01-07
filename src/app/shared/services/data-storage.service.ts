import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Recipe } from '../../recipes/models/recipe.model';
import { RecipeService } from '../../recipes/services/recipe.service';
import { getApiUrl } from '../utils/common.util';

interface PutResponse {
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();

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

  loadRecipes() {
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
