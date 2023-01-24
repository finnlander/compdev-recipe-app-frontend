import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { faTrashCanArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { sortBy } from 'lodash';
import { Observable, of } from 'rxjs';
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
  animations: [
    trigger('shoppingList', [
      state(
        'added',
        style({
          opacity: 1,
          transform: 'translateX(0)',
        })
      ),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-5rem)',
        }),
        animate(
          300,
          style({
            transform: 'translateX(1rem)',
            opacity: 1,
          })
        ),
        animate(100),
      ]),
      transition('* => void', [
        animate(
          300,
          style({
            opacity: 0,
            transform: 'translateX(15rem)',
          })
        ),
      ]),
    ]),
  ],
})
export class ShoppingListComponent
  extends SubscribingComponent
  implements OnInit, OnDestroy
{
  iconClearAll = faTrashCanArrowUp;
  listInitialization = true;
  items: ShoppingListItem[] = [];
  error$: Observable<string | null> = of(null);
  isUpdating$: Observable<boolean> = of(false);
  isEmpty = true;
  selectedItem: ShoppingListItem | null = null;

  constructor(
    private modalService: ModalService,
    private toastService: ToastService,
    private store: Store<RootState>
  ) {
    super();
  }

  ngOnInit(): void {
    this.store
      .select(shoppingListSelectors.getShoppingListItems)
      .subscribe((items) => {
        const isEmpty = items.length === 0;

        this.addTimeout(0, () => {
          this.isEmpty = isEmpty;
          this.items = sortBy(items, (it) => it.ingredient.name);

          if (this.listInitialization) {
            this.addTimeout(0, () => (this.listInitialization = false));
          }
        });
      });

    this.error$ = this.store.select(
      shoppingListSelectors.getShoppingListUpdateError
    );

    this.isUpdating$ = this.store.select(
      shoppingListSelectors.isShoppingListUpdating
    );

    this.addSubscription(
      this.store
        .select(shoppingListSelectors.getSelectedItem)
        .subscribe((selectedItem) => (this.selectedItem = selectedItem))
    );
  }

  override ngOnDestroy(): void {
    this.store.dispatch(shoppingListActions.clearUpdateError());
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

  onDismissError() {
    this.store.dispatch(shoppingListActions.clearUpdateError());
  }
}
