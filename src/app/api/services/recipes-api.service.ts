import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recipe } from '../../recipes/models/recipe.model';
import { getApiUrl, logAndUnwrapErrorMessage } from '../api-utils';
import { GenericResponse } from '../model/generic-response.model';

/**
 * A service to connect into recipes API.
 */
@Injectable({ providedIn: 'root' })
export class RecipesApi {
  constructor(private http: HttpClient) {}

  getAllRecipes(): Observable<Recipe[]> {
    const url = getApiUrl('recipes');
    return this.http
      .get<Recipe[]>(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          logAndUnwrapErrorMessage('loading recipes', error)
        )
      );
  }

  replaceAllRecipes(recipes: Recipe[]): Observable<void> {
    const url = getApiUrl('recipes');
    return this.http.put<GenericResponse>(url, recipes).pipe(
      map((_) => undefined),
      catchError((error: HttpErrorResponse) => {
        return logAndUnwrapErrorMessage('storing recipes', error);
      })
    );
  }
}
