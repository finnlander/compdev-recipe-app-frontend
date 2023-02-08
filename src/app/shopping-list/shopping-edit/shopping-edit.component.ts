import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { SubscribingComponent } from '../../shared/classes/subscribing-component';
import { ConfirmationType } from '../../shared/models/confirmation.types';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ModalService } from '../../shared/services/modal.service';
import { RootState } from '../../store/app.store';
import { ShoppingListItem } from '../models/shopping-list-item-model';
import { shoppingListActions, shoppingListSelectors } from '../store';

interface FormModel {
  name: string;
  amount: number;
  unit: RecipeUnit;
}

interface ItemData {
  ingredientName: string;
  amount: number;
  unit: RecipeUnit;
}

const DEFAULT_FORM_VALUES: FormModel = {
  name: '',
  amount: 1,
  unit: RecipeUnit.PCS,
};

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent
  extends SubscribingComponent
  implements OnInit, OnDestroy
{
  RecipeUnit = RecipeUnit;

  formMode: 'new' | 'update' = 'new';
  updateItemOrdinal = -1;
  loading$: Observable<boolean> = of(false);

  @ViewChild('form', { static: true }) addItemForm?: NgForm;

  constructor(
    private modalService: ModalService,
    private store: Store<RootState>
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.store
        .select(shoppingListSelectors.getSelectedItem)
        .subscribe((selectedItem) => this.applySelectedItemChange(selectedItem))
    );

    this.loading$ = this.store.select(
      shoppingListSelectors.isShoppingListUpdating
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // clear selection
    this.resetToDefault();
  }

  onSubmit(form: NgForm) {
    const data: ItemData = this.getItemData(form);

    if (this.formMode === 'update') {
      this.store.dispatch(
        shoppingListActions.updateItemRequest({
          ...data,
          ordinal: this.updateItemOrdinal,
        })
      );
    } else {
      this.store.dispatch(shoppingListActions.addItemRequest(data));
    }

    this.resetToDefault();
  }

  onClear() {
    setTimeout(() => this.resetToDefault(), 0);
  }

  onDelete() {
    if (this.formMode !== 'update' || !this.addItemForm) {
      return;
    }

    const data = this.getItemData(this.addItemForm);
    const itemOrdinal = this.updateItemOrdinal;

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${data.ingredientName}" shopping list item`,
      onConfirmYes: () => {
        this.store.dispatch(
          shoppingListActions.removeItem({ ordinal: itemOrdinal })
        );
        this.onClear();
      },
    });
  }

  /* Helper Methods */

  private applySelectedItemChange(
    selectedItem: ShoppingListItem | null,
    immediate = false
  ) {
    const model: FormModel = selectedItem
      ? {
          name: selectedItem.ingredient.name,
          amount: selectedItem.amount,
          unit: selectedItem.unit,
        }
      : DEFAULT_FORM_VALUES;

    const action = () => {
      this.formMode = selectedItem ? 'update' : 'new';
      this.updateItemOrdinal = selectedItem?.ordinal || -1;
      if (this.addItemForm?.controls['name']) {
        this.addItemForm?.form.setValue(model);
      }
    };

    if (immediate) action();
    else this.addTimeout(0, action);
  }

  private resetToDefault() {
    this.store.dispatch(
      shoppingListActions.setSelectedItem({
        item: null,
      })
    );
    this.applySelectedItemChange(null, true);
  }

  private getItemData(form: NgForm): ItemData {
    const model = form.value as FormModel;

    const itemData: ItemData = {
      ingredientName: model.name.trim(),
      amount: model.amount,
      unit: model.unit,
    };

    return itemData;
  }
}
