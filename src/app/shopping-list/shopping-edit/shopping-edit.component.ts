import { Component } from '@angular/core';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent {
  newName?: string;
  newAmount?: number = 1;
  newUnit?: RecipeUnit = RecipeUnit.PCS;
  RecipeUnit = RecipeUnit;

  constructor(private shoppingListService: ShoppingListService) {}

  addNewItem() {
    this.shoppingListService.addNewItem({
      ingredientName: this.newName?.trim()!!,
      amount: this.newAmount!!,
      unit: this.newUnit!!,
    });

    this.newName = '';
    this.newAmount = 1;
    this.newUnit = RecipeUnit.PCS;
  }

  clearShoppingList() {
    this.shoppingListService.clearAll();
  }
}
