import { Component, OnInit } from '@angular/core';
import { faTrashCanArrowUp } from '@fortawesome/free-solid-svg-icons';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import { ConfirmationType } from '../shared/models/confirmation.types';
import { ModalService } from '../shared/services/modal.service';
import { ToastService } from '../shared/services/toast.service';
import { RootState } from '../store/app.store';
import { ShoppingListItem } from './models/shopping-list-item-model';
import { shoppingListActions, shoppingListSelectors } from './store';

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
  items: Observable<ShoppingListItem[]> = of();
  isEmpty: boolean = true;
  selectedItem: ShoppingListItem | null = null;

  constructor(
    private modalService: ModalService,
    private toastService: ToastService,
    private store: Store<RootState>
  ) {
    super();
  }

  ngOnInit(): void {
    this.items = this.store.pipe(
      select(shoppingListSelectors.getShoppingListItems),
      tap((items) => {
        const isEmpty = items.length === 0;
        setTimeout(() => {
          this.isEmpty = isEmpty;
        }, 0);
      })
    );

    this.addSubscription(
      this.store
        .select(shoppingListSelectors.getSelectedItem)
        .subscribe((selectedItem) => (this.selectedItem = selectedItem))
    );

    /*
    if (
      environment.generateSampleData &&
      this.shoppingListService.getCount() == 0
      ) {
      // Add some samples
      this.shoppingListService.generateSampleData();
    }
    */
  }

  onSelectItem(item: ShoppingListItem) {
    const itemToSelect =
      this.selectedItem?.ordinal === item.ordinal
        ? //deselect
          null
        : item;

    this.store.dispatch(
      shoppingListActions.setSelectedItem({ item: itemToSelect })
    );
  }

  onClearAll() {
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.CLEAR_ALL,
      itemDescription: 'shopping list items',
      removeQuotes: true,
      onConfirmYes: () => {
        this.store.dispatch(shoppingListActions.clearItems());
        this.toastService.success({
          title: 'Cleared successfully',
          message: 'Shopping list was cleared successfully',
        });
      },
    });
  }
}
