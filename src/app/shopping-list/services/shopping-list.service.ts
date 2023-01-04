import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
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
    this.addNewItemToShoppingList(data);
    this.onShoppingListUpdated();
  }

  addNewItems(data: ItemData[]) {
    data.forEach((it) => this.addNewItemToShoppingList(it));
    this.onShoppingListUpdated();
  }

  deleteItem(ordinal: number) {
    const item = this.findItemByOrdinal(ordinal);
    if (!item) {
      return;
    }

    _.remove(this.items, (it) => it.ordinal === ordinal);

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

    this.updateShoppingListItem(item, data);
    this.onShoppingListUpdated();
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

  generateSampleData() {
    this.addNewItem({
      ingredientName: 'Apples',
      amount: 5,
      unit: RecipeUnit.PCS,
    });

    this.addNewItem({
      ingredientName: 'Grapes',
      amount: 10,
      unit: RecipeUnit.PCS,
    });
  }

  /* Helper Methods */

  private addNewItemToShoppingList(data: ItemData) {
    const ingredient = this.ingredientService.getOrAddIngredient(
      data.ingredientName
    );

    const item = this.getOrCreateItem(ingredient, data.unit);
    item.amount += data.amount;
  }

  private updateShoppingListItem(item: ShoppingListItem, data: ItemData) {
    if (item.ingredient.name !== data.ingredientName) {
      const ingredient = this.ingredientService.getOrAddIngredient(
        data.ingredientName
      );
      item.ingredient = ingredient;
    }

    item.amount = data.amount;
    item.unit = data.unit;
  }

  private findItemByOrdinal(ordinal: number) {
    return _.find(this.items, (it) => it.ordinal === ordinal);
  }

  private getOrCreateItem(
    ingredient: Ingredient,
    unit: RecipeUnit
  ): ShoppingListItem {
    const existingItem = _.find(
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
