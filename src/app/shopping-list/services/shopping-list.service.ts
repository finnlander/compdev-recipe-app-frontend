import { Injectable } from '@angular/core';
import { find, remove } from 'lodash';
import { forkJoin, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { IngredientService } from '../../shared/services/ingredient.service';
import { ShoppingListItem } from '../models/shopping-list-item-model';

export interface IngredientChangeEvent {
  type: 'add' | 'delete';
  ingredient: Ingredient;
}

export interface ItemData {
  ingredientName: string;
  amount: number;
  unit: RecipeUnit;
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private items: ShoppingListItem[] = [];

  shoppingListChanged = new Subject<ShoppingListItem[]>();

  constructor(private ingredientService: IngredientService) {}

  addNewItem(data: ItemData) {
    this.addNewItemToShoppingList(data).subscribe(() =>
      this.onShoppingListUpdated()
    );
  }

  addNewItems(data: ItemData[]) {
    const observables = data.map((it) => this.addNewItemToShoppingList(it));
    forkJoin(observables).subscribe(() => this.onShoppingListUpdated());
  }

  deleteItem(ordinal: number) {
    const item = this.findItemByOrdinal(ordinal);
    if (!item) {
      return;
    }

    remove(this.items, (it) => it.ordinal === ordinal);

    this.items.forEach((item, index) => {
      item.ordinal = index + 1;
    });

    this.onShoppingListUpdated();
  }

  updateItem(ordinal: number, data: ItemData) {
    const item = this.findItemByOrdinal(ordinal);
    if (!item) {
      return;
    }

    this.updateShoppingListItem(item, data).subscribe(() =>
      this.onShoppingListUpdated()
    );
  }

  clearAll() {
    this.items = [];
    console.debug('cleared shopping list');

    this.onShoppingListUpdated();
  }

  getItems() {
    return [...this.items];
  }

  getCount() {
    return this.items.length;
  }

  /* Helper Methods */

  private addNewItemToShoppingList(data: ItemData) {
    return this.ingredientService.getOrAddIngredient(data.ingredientName).pipe(
      map((ingredient) => {
        const item = this.getOrCreateItem(ingredient, data.unit);
        item.amount += data.amount;
        return item;
      })
    );
  }

  private updateShoppingListItem(item: ShoppingListItem, data: ItemData) {
    if (item.ingredient.name !== data.ingredientName) {
      return this.ingredientService
        .getOrAddIngredient(data.ingredientName)
        .pipe(
          map((ingredient) => {
            item.ingredient = ingredient;
            item.amount = data.amount;
            item.unit = data.unit;

            return item;
          })
        );
    }

    item.amount = data.amount;
    item.unit = data.unit;

    return of(item);
  }

  private findItemByOrdinal(ordinal: number) {
    return find(this.items, (it) => it.ordinal === ordinal);
  }

  private getOrCreateItem(
    ingredient: Ingredient,
    unit: RecipeUnit
  ): ShoppingListItem {
    const existingItem = find(
      this.items,
      (it) => it.ingredient.id === ingredient.id && it.unit === unit
    );
    if (existingItem) return existingItem;

    const ordinal = this.items.length + 1;
    const item = new ShoppingListItem(ordinal, ingredient, 0.0, unit);
    this.items.push(item);

    return item;
  }

  private onShoppingListUpdated() {
    this.shoppingListChanged.next([...this.items]);
  }
}
