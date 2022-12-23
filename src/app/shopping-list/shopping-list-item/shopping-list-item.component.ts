import { Component, Input } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ShoppingListItem } from '../models/shopping-list-item-model';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-shopping-list-item',
  templateUrl: './shopping-list-item.component.html',
  styleUrls: ['./shopping-list-item.component.css'],
})
export class ShoppingListItemComponent {
  @Input() item?: ShoppingListItem;

  iconTrash = faTrash;

  constructor(private shoppingListService: ShoppingListService) {}

  deleteItem() {
    this.shoppingListService.deleteItem(this.item!!.ordinal);
  }
}
