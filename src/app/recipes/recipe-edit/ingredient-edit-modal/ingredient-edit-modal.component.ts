import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { first } from 'lodash';
import { RecipeUnit } from '../../../shared/models/recipe-unit.model';
import { RecipeIngredientPayloadItem } from '../../store';

export interface IngredientEditDialogData {
  usePhases: boolean;
  phases?: string[];
  defaultPhase?: string;
  ingredient?: RecipeIngredientPayloadItem;
}

export interface IngredientEditDialogResult {
  ingredient: RecipeIngredientPayloadItem;
}

const DEFAULT_INGREDIENT_VALUES: RecipeIngredientPayloadItem = {
  ingredientName: '',
  amount: 1,
  unit: RecipeUnit.PCS,
  phase: '',
};

@Component({
  selector: 'app-ingredient-edit-modal',
  templateUrl: './ingredient-edit-modal.component.html',
  styleUrls: ['./ingredient-edit-modal.component.css'],
})
export class IngredientEditModalComponent {
  RecipeUnit = RecipeUnit;
  form: ReturnType<typeof IngredientEditModalComponent.createForm>;

  constructor(
    fb: FormBuilder,
    public dialogRef: MatDialogRef<
      IngredientEditModalComponent,
      IngredientEditDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: IngredientEditDialogData
  ) {
    this.form = IngredientEditModalComponent.createForm(fb, data);
  }

  onSave() {
    /* TODO */
    const value = this.form.value;
    console.log('form value:', this.form.value);

    const res: IngredientEditDialogResult = {
      ingredient: {
        ingredientName:
          value.ingredientName || DEFAULT_INGREDIENT_VALUES.ingredientName,
        amount: value.amount || DEFAULT_INGREDIENT_VALUES.amount,
        unit: value.unit || DEFAULT_INGREDIENT_VALUES.unit,
        phase: value.phase || undefined,
      },
    };

    this.dialogRef.close(res);
  }

  onDismiss() {
    this.dialogRef.close();
  }

  /* Helper Methods */
  private static createForm(fb: FormBuilder, data: IngredientEditDialogData) {
    const input = data.ingredient || DEFAULT_INGREDIENT_VALUES;
    const phase = !data.usePhases
      ? ''
      : input.phase || data.defaultPhase || first(data.phases) || '';

    const model = {
      ...input,
      phase: phase,
    };

    const ingredientForm = fb.group(
      {
        ingredientName: ['', Validators.required],
        amount: [
          1,
          { validators: [Validators.required, Validators.min(0.001)] },
        ],
        unit: [RecipeUnit.PCS, Validators.required],
        phase: '',
      },
      { updateOn: 'change' }
    );

    ingredientForm.setValue(model);
    return ingredientForm;
  }
}
