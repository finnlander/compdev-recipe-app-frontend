import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recipe } from '../../recipes/models/recipe.model';
import {
  ApiResponse,
  getApiUrl,
  logAndWrapErrorMessage,
  wrapToSuccessResponse,
} from '../api-utils';
import { GenericResponse } from '../model/generic-response.model';

/**
 * A service to connect into recipes API.
 */
@Injectable({ providedIn: 'root' })
export class RecipesApi {
  constructor(private http: HttpClient) {}

  getAllRecipes(): Observable<ApiResponse<Recipe[]>> {
    const url = getApiUrl('recipes');
    return this.http.get<Recipe[]>(url).pipe(
      map((recipes) => wrapToSuccessResponse(recipes)),
      catchError((error: HttpErrorResponse) =>
        logAndWrapErrorMessage('loading recipes', error)
      )
    );
  }

  replaceAllRecipes(recipes: Recipe[]): Observable<ApiResponse<void>> {
    const url = getApiUrl('recipes');
    return this.http.put<GenericResponse>(url, recipes).pipe(
      map(() => wrapToSuccessResponse(undefined)),
      catchError((error: HttpErrorResponse) => {
        return logAndWrapErrorMessage('storing recipes', error);
      })
    );
  }
}
