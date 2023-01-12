import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Ingredient } from '../../shared/models/ingredient.model';
import { getApiUrl, logAndUnwrapErrorMessage } from '../api-utils';

/**
 * A service to connect into ingredients API.
 */
@Injectable({ providedIn: 'root' })
export class IngredientsApi {
  constructor(private http: HttpClient) {}

  /**
   * Get or add (if missing) batch of ingredients from the backend.
   */
  getOrAddIngredients(ingredientNames: string[]) {
    const url = getApiUrl('ingredients');
    const body = { ingredientNames };

    return this.http
      .post<Ingredient[]>(url, body)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          logAndUnwrapErrorMessage('adding ingredients', error)
        )
      );
  }

  /**
   * Get all ingredients from the backend.
   */
  getAllIngredients() {
    const url = getApiUrl('ingredients');
    return this.http
      .get<Ingredient[]>(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          logAndUnwrapErrorMessage('loading ingredients', error)
        )
      );
  }
}
