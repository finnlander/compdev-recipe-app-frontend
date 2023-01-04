import { Component, Input } from '@angular/core';
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
export class ShoppingListItemComponent {
  @Input() item?: ShoppingListItem;

  iconTrash = faTrash;

  constructor(
    private shoppingListService: ShoppingListService,
    private modalService: ModalService
  ) {}

  deleteItem() {
    if (!this.item) {
      console.debug('delete triggered without item');
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: this.item.ingredient.name,
      onConfirmationResult: (res) => {
        if (res == ConfirmationResult.YES) {
          this.shoppingListService.deleteItem(this.item!!.ordinal);
          console.debug(
            'deletion completed for "' + this.item?.ingredient.name + '"'
          );
        } else {
          console.debug(
            'deletion aborted for "' + this.item?.ingredient.name + '"'
          );
        }
      },
    });
  }
}
