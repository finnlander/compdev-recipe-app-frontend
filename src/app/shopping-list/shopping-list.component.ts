import { Component, OnInit } from '@angular/core';
import { faTrashCanArrowUp } from '@fortawesome/free-solid-svg-icons';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../shared/models/confirmation.types';
import { ModalService } from '../shared/services/modal.service';
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
  iconClearAll = faTrashCanArrowUp;
  items: ShoppingListItem[] = [];
  selectedItem?: ShoppingListItem;

  constructor(
    private shoppingListService: ShoppingListService,
    private modalService: ModalService
  ) {
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

  onClearAll() {
    if (this.items.length === 0) {
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.CLEAR_ALL,
      itemDescription: 'shopping list items',
      removeQuotes: true,
      onConfirmationResult: (res) => {
        if (res == ConfirmationResult.YES) {
          this.shoppingListService.clearAll();
        }
      },
    });
  }
}
