import { EventEmitter, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Ingredient } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private ingredients: Ingredient[] = [];

  ingredientsChanged = new EventEmitter<Ingredient[]>();

  constructor() {}

  getOrAddIngredient(ingredientName: string): Ingredient {
    const existingIngredient = _.find(
      this.ingredients,
      (it) => it.name === ingredientName
    );

    if (existingIngredient) {
      return existingIngredient;
    }

    const id = this.ingredients.length + 1;
    const ingredient = new Ingredient(id, ingredientName);

    this.ingredients.push(ingredient);
    this.onIngredientsChanged();

    return ingredient;
  }

  deleteIngredient(id: number) {
    const ingredient = _.find(this.ingredients, (it) => it.id === id);
    if (!ingredient) {
      return;
    }

    _.remove(this.ingredients, (it) => it.id === id);
    this.onIngredientsChanged();
  }

  getIngredients() {
    return [...this.ingredients];
  }

  private onIngredientsChanged() {
    this.ingredientsChanged.emit([...this.ingredients]);
  }
}
