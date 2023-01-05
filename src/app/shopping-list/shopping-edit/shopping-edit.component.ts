import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  faCheck,
  faPlus,
  faTrashCan,
  faUndo,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationType } from '../../shared/models/confirmation.types';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ModalService } from '../../shared/services/modal.service';
import { ShoppingListItem } from '../models/shopping-list-item-model';
import {
  ItemData,
  ShoppingListService,
} from '../services/shopping-list.service';

interface FormModel {
  name: string;
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
export class ShoppingEditComponent implements AfterViewInit, OnChanges {
  RecipeUnit = RecipeUnit;
  iconAdd = faPlus;
  iconCancel = faUndo;
  iconClear = faTrashCan;
  iconDelete = faX;
  iconUpdate = faCheck;

  @Input() shoppingListItem?: ShoppingListItem;
  @Output() onCompleted = new EventEmitter<void>();
  @ViewChild('form', { static: true }) addItemForm?: NgForm;

  constructor(
    private shoppingListService: ShoppingListService,
    private modalService: ModalService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      const model: FormModel = this.shoppingListItem
        ? {
            name: this.shoppingListItem.ingredient.name,
            amount: this.shoppingListItem.amount,
            unit: this.shoppingListItem.unit,
          }
        : DEFAULT_FORM_VALUES;

      this.addItemForm!!.form.setValue(model);
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const shoppingListItemChange = changes['shoppingListItem'];
    if (shoppingListItemChange) {
      if (!shoppingListItemChange.isFirstChange()) {
        const model = this.getCurrentModel();
        this.addItemForm?.form.setValue(model);
      }
    }
  }

  onSubmit(form: NgForm) {
    const data: ItemData = this.getItemData(form);

    if (this.shoppingListItem) {
      this.shoppingListService.updateItem(this.shoppingListItem.ordinal, data);
    } else {
      this.shoppingListService.addNewItem(data);
    }

    this.addItemForm?.reset(DEFAULT_FORM_VALUES);
    this.onCompleted.emit();
  }

  onClear() {
    setTimeout(() => {
      this.addItemForm?.reset(DEFAULT_FORM_VALUES);
    }, 0);
    this.onCompleted.emit();
  }

  onDelete() {
    if (!this.shoppingListItem) {
      return;
    }

    const targetItem = this.shoppingListItem;
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${targetItem.ingredient.name}" shopping list item`,
      onConfirmYes: () => {
        this.shoppingListService.deleteItem(targetItem.ordinal);
        this.onClear();
      },
    });
  }

  /* Helper Methods */

  private getCurrentModel(): FormModel {
    const model: FormModel = this.shoppingListItem
      ? {
          name: this.shoppingListItem.ingredient.name,
          amount: this.shoppingListItem.amount,
          unit: this.shoppingListItem.unit,
        }
      : DEFAULT_FORM_VALUES;

    return model;
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
