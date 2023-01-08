import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Ingredient } from '../models/ingredient.model';
import { getApiUrl } from '../utils/common.util';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  // local cache structures
  private ingredientsById: Map<number, Ingredient> = new Map();
  private ingredientIdsByName: Map<string, number> = new Map();

  constructor(private http: HttpClient) {}

  getOrAddIngredients(ingredientNames: string[]): Observable<Ingredient[]> {
    if (
      ingredientNames.every((ingredientName) =>
        this.ingredientIdsByName.has(ingredientName)
      )
    ) {
      // use local cache
      const ingredients = ingredientNames.map((ingredientName) => {
        const id = this.ingredientIdsByName.get(ingredientName)!!;
        return this.ingredientsById.get(id)!!;
      });

      return of(ingredients);
    }

    // fetch from backend, if any cache misses (to simplify things)
    return this.requestNewIngredients(ingredientNames);
  }

  getOrAddIngredient(ingredientName: string): Observable<Ingredient> {
    const existingId = this.ingredientIdsByName.get(ingredientName);
    if (existingId) {
      return of(this.ingredientsById.get(existingId)!!);
    }

    return this.requestNewIngredient(ingredientName).pipe(
      tap((ingredient) => {
        this.ingredientsById.set(ingredient.id, ingredient);
        this.ingredientIdsByName.set(ingredientName, ingredient.id);
      })
    );
  }

  getIngredients() {
    return [...this.ingredientsById.values()];
  }

  loadIngredients() {
    this.ingredientIdsByName.clear();
    this.ingredientsById.clear();

    return this.queryAllIngredients().pipe(
      tap((ingredients) => {
        ingredients.forEach((ingredient) => this.setToCache(ingredient));
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Ingredient loading failed on error: ', err);
        return throwError(err.message);
      })
    );
  }

  private requestNewIngredient(ingredientName: string) {
    const url = getApiUrl('ingredients');
    const body = { ingredientNames: [ingredientName] };

    return this.requestNewIngredients([ingredientName]).pipe(
      map((ingredients) => ingredients[0])
    );
  }

  private requestNewIngredients(ingredientNames: string[]) {
    const url = getApiUrl('ingredients');
    const body = { ingredientNames };

    return this.http.post<Ingredient[]>(url, body).pipe(
      tap((ingredients) =>
        ingredients.forEach((ingredient) => this.setToCache(ingredient))
      ),
      catchError((err: HttpErrorResponse) => {
        console.error('Ingredient add failed on error: ', err);
        return throwError(err.message);
      })
    );
  }

  private setToCache(ingredient: Ingredient) {
    this.ingredientIdsByName.set(ingredient.name, ingredient.id);
    this.ingredientsById.set(ingredient.id, ingredient);
  }

  private clearFromCache(ingredient: Ingredient) {
    this.ingredientIdsByName.delete(ingredient.name);
    this.ingredientsById.delete(ingredient.id);
  }

  private queryAllIngredients() {
    const url = getApiUrl('ingredients');

    return this.http.get<Ingredient[]>(url);
  }
}
