import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../../shared/models/confirmation.types';
import { ModalService } from '../../shared/services/modal.service';
import { RootState } from '../../store/app.store';
import { ShoppingListItem } from '../models/shopping-list-item-model';
import { shoppingListActions } from '../store';

@Component({
  selector: 'app-shopping-list-item',
  templateUrl: './shopping-list-item.component.html',
  styleUrls: ['./shopping-list-item.component.css'],
})
export class ShoppingListItemComponent implements OnInit, OnChanges {
  @Input() item!: ShoppingListItem;

  newAmount = 0;

  iconTrash = faTrash;

  constructor(
    private modalService: ModalService,
    private store: Store<RootState>
  ) {}

  ngOnInit(): void {
    this.newAmount = this.item.amount;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const itemChange = changes['item'];
    if (!itemChange.firstChange) {
      const prev = itemChange.previousValue as ShoppingListItem | undefined;
      const current = itemChange.currentValue as ShoppingListItem | undefined;
      if (prev?.amount != current?.amount) {
        // reset input value when the list is updated (to make sure the values remains in sync)
        this.newAmount = current?.amount || 0;
      }
    }
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
          this.store.dispatch(
            shoppingListActions.removeItem({ ordinal: item.ordinal })
          );

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

    this.store.dispatch(
      shoppingListActions.updateItemRequest({
        ordinal: item.ordinal,
        ingredientName: item.ingredient.name,
        amount: this.newAmount,
        unit: item.unit,
      })
    );
  }

  onAmountClick(event: Event) {
    // prevent component click listener on amount update
    event.stopPropagation();
  }
}
