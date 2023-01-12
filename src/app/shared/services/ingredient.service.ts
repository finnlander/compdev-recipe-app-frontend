import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IngredientsApi } from '../../api/services/ingredients-api.service';
import { Ingredient } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  // local cache structures
  private ingredientsById: Map<number, Ingredient> = new Map();
  private ingredientIdsByName: Map<string, number> = new Map();

  constructor(private ingredientsApi: IngredientsApi) {}

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

    return this.ingredientsApi.getAllIngredients().pipe(
      tap((ingredients) => {
        ingredients.forEach((ingredient) => this.setToCache(ingredient));
      })
    );
  }

  private requestNewIngredient(ingredientName: string) {
    return this.requestNewIngredients([ingredientName]).pipe(
      map((ingredients) => ingredients[0])
    );
  }

  private requestNewIngredients(ingredientNames: string[]) {
    return this.ingredientsApi
      .getOrAddIngredients(ingredientNames)
      .pipe(
        tap((ingredients) =>
          ingredients.forEach((ingredient) => this.setToCache(ingredient))
        )
      );
  }

  private setToCache(ingredient: Ingredient) {
    this.ingredientIdsByName.set(ingredient.name, ingredient.id);
    this.ingredientsById.set(ingredient.id, ingredient);
  }
}
