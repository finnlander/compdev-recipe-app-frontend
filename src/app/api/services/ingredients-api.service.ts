import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Ingredient } from '../../shared/models/ingredient.model';
import {
  ApiResponse,
  getApiUrl,
  logAndWrapErrorMessage,
  wrapToSuccessResponse,
} from '../api-utils';

/**
 * A service to connect into ingredients API.
 */
@Injectable({ providedIn: 'root' })
export class IngredientsApi {
  constructor(private http: HttpClient) {}

  /**
   * Get or add (if missing) batch of ingredients from the backend.
   */
  getOrAddIngredients(
    ingredientNames: string[]
  ): Observable<ApiResponse<Ingredient[]>> {
    const url = getApiUrl('ingredients');
    const body = { ingredientNames };

    return this.http.post<Ingredient[]>(url, body).pipe(
      map((res) => wrapToSuccessResponse(res)),
      catchError((error: HttpErrorResponse) =>
        logAndWrapErrorMessage('adding ingredients', error)
      )
    );
  }

  /**
   * Get all ingredients from the backend.
   */
  getAllIngredients(): Observable<ApiResponse<Ingredient[]>> {
    const url = getApiUrl('ingredients');
    return this.http.get<Ingredient[]>(url).pipe(
      map((res) => wrapToSuccessResponse(res)),
      catchError((error: HttpErrorResponse) =>
        logAndWrapErrorMessage('loading ingredients', error)
      )
    );
  }
}
