import { Component, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { take } from 'lodash';
import { map, Observable, of, startWith } from 'rxjs';
import { SubscribingComponent } from '../../classes/subscribing-component';
import { IngredientService } from '../../services/ingredient.service';

/**
 * Custom ingredient name input component that supports use with Angular forms and provides autocomplete functionality
 * without restricting using any (custom) value.
 */
@Component({
  selector: 'app-ingredient-field',
  templateUrl: './ingredient-input-field.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: IngredientInputFieldComponent,
    },
  ],
})
export class IngredientInputFieldComponent
  extends SubscribingComponent
  implements OnInit, ControlValueAccessor
{
  value = '';
  touched = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: string) => {
    /* */
  };
  onTouched = () => {
    /* */
  };

  @Input() maxSuggestions = 5;

  control: FormControl = new FormControl({ value: '', disabled: false });
  ingredientNames: string[] = [];
  filteredNames$: Observable<string[]> = of([]);

  constructor(private ingredientService: IngredientService) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.ingredientService.ingredients$.subscribe((ingredients) => {
        this.ingredientNames = ingredients.map((it) => it.name);
        this.control.setValue(this.control.value + '');
      })
    );

    this.filteredNames$ = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterByValue(value))
    );
  }

  onBlur() {
    this._markAsTouched();
    if (this.control.disabled) {
      return;
    }

    this.value = this.control.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value;
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled === this.control.disabled) {
      return;
    }

    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  /* Helper Methods */

  private _markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  private _filterByValue(value: string) {
    const filterValue = value.toLowerCase();
    const matches = take(
      this.ingredientNames.filter((it) =>
        it.toLowerCase().includes(filterValue)
      ),
      this.maxSuggestions
    );

    return matches.sort((a, b) => {
      return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
    });
  }
}
