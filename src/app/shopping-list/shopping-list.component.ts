import { Component, OnInit } from '@angular/core';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import { ShoppingListItem } from './models/shopping-list-item-model';
import { ShoppingListService } from './services/shopping-list.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent
  extends SubscribingComponent
  implements OnInit
{
  items: ShoppingListItem[] = [];
  selectedItem?: ShoppingListItem;

  constructor(private shoppingListService: ShoppingListService) {
    super();
  }

  ngOnInit(): void {
    // Add some samples
    if (this.shoppingListService.getCount() == 0) {
      this.shoppingListService.generateSampleData();
    }

    this.addSubscription(
      this.shoppingListService.shoppingListChanged.subscribe(
        (updatedItems) => (this.items = updatedItems)
      )
    );

    this.items = this.shoppingListService.getItems();
  }

  onSelectItem(item: ShoppingListItem) {
    if (this.selectedItem?.ordinal === item.ordinal) {
      //deselect
      this.selectedItem = undefined;
    } else {
      this.selectedItem = item;
    }
  }

  onEditCompleted() {
    this.selectedItem = undefined;
  }
}
