import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { IngredientsApi } from '../../api/services/ingredients-api.service';
import { Ingredient } from '../models/ingredient.model';

/**
 * Service for accessing ingredients data that includes some caching mechanism on top of the underlying API.
 */
@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  // local cache structures
  private ingredientsById: Map<number, Ingredient> = new Map();
  private ingredientIdsByName: Map<string, number> = new Map();

  ingredients$ = new BehaviorSubject<Ingredient[]>([]);

  constructor(private ingredientsApi: IngredientsApi) {}

  getOrAddIngredients(ingredientNames: string[]): Observable<Ingredient[]> {
    if (
      ingredientNames.every((ingredientName) =>
        this.ingredientIdsByName.has(ingredientName)
      )
    ) {
      // use local cache
      const ingredients = ingredientNames.map((ingredientName) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const id = this.ingredientIdsByName.get(ingredientName)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.ingredientsById.get(id)!;
      });

      return of(ingredients);
    }

    // fetch from backend, if any cache misses (to simplify things)
    return this.requestNewIngredients(ingredientNames);
  }

  getOrAddIngredient(ingredientName: string): Observable<Ingredient> {
    const existingId = this.ingredientIdsByName.get(ingredientName);
    if (existingId) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return of(this.ingredientsById.get(existingId)!);
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

    this.ingredientsApi
      .getAllIngredients()
      .pipe(
        take(1),
        tap((res) => {
          if (res.ok) {
            res.data.forEach((ingredient) => this.setToCache(ingredient));
            this.reportIngredientsChanged();
          }
        })
      )
      .subscribe();
  }

  private reportIngredientsChanged() {
    const ingredients = [...this.ingredientsById.values()];
    this.ingredients$.next(ingredients);
  }

  private requestNewIngredient(ingredientName: string): Observable<Ingredient> {
    return this.requestNewIngredients([ingredientName]).pipe(
      map((ingredients) => ingredients[0])
    );
  }

  private requestNewIngredients(
    ingredientNames: string[]
  ): Observable<Ingredient[]> {
    return this.ingredientsApi.getOrAddIngredients(ingredientNames).pipe(
      tap((res) => {
        if (res.ok) {
          res.data.forEach((ingredient) => this.setToCache(ingredient));
          this.reportIngredientsChanged();
        }
      }),
      map((res) => {
        if (res.ok) {
          return res.data;
        }
        throw Error(res.error);
      })
    );
  }

  private setToCache(ingredient: Ingredient) {
    this.ingredientIdsByName.set(ingredient.name, ingredient.id);
    this.ingredientsById.set(ingredient.id, ingredient);
  }
}
