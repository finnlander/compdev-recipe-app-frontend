import { Component, Input, OnInit } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../../shared/models/confirmation.types';
import { ModalService } from '../../shared/services/modal.service';
import { ShoppingListItem } from '../models/shopping-list-item-model';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-shopping-list-item',
  templateUrl: './shopping-list-item.component.html',
  styleUrls: ['./shopping-list-item.component.css'],
})
export class ShoppingListItemComponent implements OnInit {
  @Input() item?: ShoppingListItem;

  newAmount: number = 0;

  iconTrash = faTrash;

  constructor(
    private shoppingListService: ShoppingListService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.newAmount = this.item?.amount || 0;
  }

  deleteItem() {
    const item = this.item;
    if (!item) {
      console.debug('delete triggered without item');
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: item.ingredient.name,
      onConfirmationResult: (res) => {
        if (res == ConfirmationResult.YES) {
          this.shoppingListService.deleteItem(item.ordinal);
          console.debug(
            'deletion completed for "' + item.ingredient.name + '"'
          );
        } else {
          console.debug('deletion aborted for "' + item.ingredient.name + '"');
        }
      },
    });
  }

  onAmountUpdate() {
    const item = this.item;

    if (!item) {
      return;
    }

    if (isNaN(this.newAmount) || this.newAmount <= 0) {
      this.newAmount = item.amount;
      return;
    }

    //this.item!!.amount = this.newAmount;
    this.shoppingListService.updateItem(item.ordinal, {
      ingredientName: item.ingredient.name,
      amount: this.newAmount,
      unit: item.unit,
    });
  }

  onAmountClick(event: Event) {
    // prevent component click listener on amount update
    event.stopPropagation();
  }
}
