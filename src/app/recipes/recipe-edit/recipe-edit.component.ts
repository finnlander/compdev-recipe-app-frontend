import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { chain, isEqual, remove } from 'lodash';
import { Observable, of } from 'rxjs';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import { ConfirmationType } from '../../shared/models/confirmation.types';
import { ItemWithOrdinal } from '../../shared/models/payloads.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { toHash } from '../../shared/utils/common.util';
import { RootState } from '../../store/app.store';
import { Recipe, RecipeAdapter, RecipeItem } from '../models/recipe.model';
import { reactOnRecipesActionResult } from '../recipes-util';
import {
  recipeActions,
  RecipeIngredientPayloadItem,
  recipeSelectors,
} from '../store';
import {
  IngredientEditDialogData,
  IngredientEditDialogResult,
  IngredientEditModalComponent,
} from './ingredient-edit-modal/ingredient-edit-modal.component';

/* Types */

type EditMode = 'new' | 'edit';
type FormModel = {
  name: string;
  description: string;
  imageUrl: string;
  usePhases: boolean;
  newPhaseName: string;
};

/* Default value initializations */

const DEFAULT_RECIPE_IMG =
  'https://cdn-icons-png.flaticon.com/512/3565/3565418.png';

const DEFAULT_VALUES: FormModel = {
  name: '',
  description: '',
  imageUrl: DEFAULT_RECIPE_IMG,
  usePhases: false,
  newPhaseName: '',
};

/**
 * Recipe edit form component.
 */
@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent
  extends IdPathTrackingComponent
  implements OnInit, OnDestroy
{
  RecipeUnit = RecipeUnit;
  selectedRecipe: Recipe | null = null;
  mode: EditMode = 'new';
  form: ReturnType<typeof RecipeEditComponent.createForm>;

  loading$: Observable<boolean> = of(false);
  ingredientData: IngredientDataAdapter = new IngredientDataAdapter();

  constructor(
    route: ActivatedRoute,
    private modalService: ModalService,
    private toastService: ToastService,
    private router: Router,
    private store: Store<RootState>,
    private actions$: Actions,
    private dialog: MatDialog,
    fb: FormBuilder
  ) {
    super(route);
    this.form = RecipeEditComponent.createForm(fb);
  }

  get usePhases(): boolean {
    return this.form.controls['usePhases'].value || false;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.mode = this.getMode();

    if (this.mode === 'new') {
      this.form.setValue(DEFAULT_VALUES);
    }

    this.loading$ = this.store.select(recipeSelectors.isLoading);

    this.addSubscription(
      this.store
        .select(recipeSelectors.getSelectedRecipe)
        .subscribe((selectedRecipe) => {
          this.onSelectedRecipeChanged(selectedRecipe?.id, selectedRecipe);
        })
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(recipeActions.setSelectedRecipe({ id: null }));
  }

  canSave(): boolean {
    const { dirty, touched, valid } = this.form;
    return dirty && touched && valid;
  }

  canAddPhase(): boolean {
    const newPhaseName = this.form.value.newPhaseName;
    return !!newPhaseName && !this.ingredientData.hasPhase(newPhaseName);
  }

  canDeletePhase(phaseName: string): boolean {
    return !this.ingredientData.isPhaseInUse(phaseName);
  }

  onSubmit() {
    if (!this.canSave()) {
      console.debug('Ignored "save" button press: canSave() returned false');
      return;
    }
    const isNew = this.mode === 'new';
    const recipe = this.selectedRecipe;

    if (!isNew && !recipe) {
      return;
    }

    const model = this.getData();
    const data = {
      ...model,
      imageUrl: model.imageUrl || DEFAULT_RECIPE_IMG,
      ingredientItems: this.ingredientData.items.map((it) => {
        if (this.usePhases) {
          return it;
        } else {
          return { ...it, phase: undefined };
        }
      }),
    };

    const action = isNew
      ? recipeActions.addRecipeRequest(data)
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        recipeActions.updateRecipeRequest({ ...data, id: recipe!.id });

    const successAction = isNew
      ? recipeActions.addRecipeSuccess
      : recipeActions.updateRecipeSuccess;

    reactOnRecipesActionResult(this.actions$, {
      successAction,
      onSuccess: () => {
        this.toastService.success({
          title: 'Saved successfully',
          message: `Recipe "${data.name}" ${
            isNew ? 'created' : 'saved'
          } successfully`,
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      onFailure: (error) => {
        this.toastService.error({
          title: 'Saving failed',
          message: `Recipe "${data.name}" ${
            isNew ? 'creation' : 'saving'
          } failed on error: ${error}`,
        });
      },
    });
    this.store.dispatch(action);
  }

  onCancel() {
    if (!this.canSave()) {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DISCARD,
      itemDescription: `all changes`,
      removeQuotes: true,
      onConfirmYes: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
    });
  }

  onAddPhase() {
    const newPhaseName = this.form.value.newPhaseName;
    if (!newPhaseName) {
      return;
    }

    const isFirst = !this.ingredientData.hasPhases;
    this.ingredientData.addPhase(newPhaseName);

    if (isFirst) {
      this.ingredientData.applyDefaultPhase();
    }

    this.form.patchValue({ newPhaseName: '' });
  }

  onDeletePhase(phase: string) {
    this.ingredientData.deletePhase(phase);
  }

  onAddOrEditIngredient(initialValue?: RecipeIngredientPayloadItem) {
    const lastItem = this.ingredientData.lastItem;

    const data: IngredientEditDialogData = {
      usePhases: this.usePhases,
      phases: this.ingredientData.phases,
      defaultPhase: lastItem?.phase,
      ingredient: initialValue,
    };
    const modalRef = this.dialog.open<
      IngredientEditModalComponent,
      IngredientEditDialogData,
      IngredientEditDialogResult
    >(IngredientEditModalComponent, {
      data,
      autoFocus: initialValue ? 'dialog' : 'first-tabbable',
    });
    const subscription = modalRef.afterClosed().subscribe((res) => {
      if (res) {
        if (!initialValue) {
          this.ingredientData.addItem(res.ingredient);
        } else {
          this.ingredientData.updateItem(initialValue, res.ingredient);
        }
        this.form.markAsTouched();
        this.form.markAsDirty();
      }

      subscription.unsubscribe();
    });
  }

  onDeleteIngredient(value: RecipeIngredientPayloadItem) {
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${value.ingredientName}" ingredient`,
      removeQuotes: true,
      onConfirmYes: () => this.handleDeleteIngredient(value),
    });
  }

  onCurrentIdChanged(currentId: Recipe['id'] | undefined): void {
    this.mode = this.getMode();
    if (currentId === this.selectedRecipe?.id) {
      return;
    }

    if (this.mode === 'new') {
      this.selectedRecipe = null;
    } else {
      if (currentId) {
        this.store.dispatch(recipeActions.setSelectedRecipe({ id: currentId }));
      } else {
        console.debug(
          'non-existing id value in recipe edit mode -> navigating away'
        );
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    }
  }

  onPhaseDrop(event: CdkDragDrop<FormArray<FormControl>>) {
    this.ingredientData.movePhase(event.previousIndex, event.currentIndex);

    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  onIngredientDrop(
    event: CdkDragDrop<unknown, unknown, IngredientData>,
    targetPhase?: string
  ) {
    const targetItem = event.item.data;
    const phase = this.usePhases ? targetPhase : undefined;

    this.ingredientData.moveItem(targetItem, phase, event.currentIndex);

    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  /* Helper Methods */
  private static createForm(fb: FormBuilder) {
    const defaultFieldOptions: AbstractControlOptions = {
      updateOn: 'change',
    };

    return fb.group({
      name: ['', { ...defaultFieldOptions, validators: [Validators.required] }],
      description: [
        '',
        { ...defaultFieldOptions, validators: [Validators.required] },
      ],
      imageUrl: ['', { updateOn: 'blur' }],
      usePhases: [false, defaultFieldOptions],
      newPhaseName: ['', defaultFieldOptions],
    });
  }

  private handleDeleteIngredient(item: RecipeIngredientPayloadItem) {
    this.ingredientData.deleteItem(item);
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  private onSelectedRecipeChanged(
    id: Recipe['id'] | undefined,
    recipe: Recipe | null
  ) {
    if (this.mode === 'edit' && !recipe) {
      console.warn(
        'Selected non-existing recipe #' + id + ' -> navigating to parent path'
      );
      this.router.navigate(['../'], { relativeTo: this.route });
    }

    this.selectedRecipe = recipe;
    this.syncFieldsFrom(recipe);
  }

  private syncFieldsFrom(recipe: Recipe | null) {
    this.ingredientData = new IngredientDataAdapter();

    if (!recipe) {
      return;
    }

    const recipeAdapter = new RecipeAdapter(recipe);
    const phaseNames = recipeAdapter.phaseNames;

    const ingredientItems = recipeAdapter
      .getItemsWithPhaseName()
      .map((item) => toRecipeIngredientPayload(item, item.phase));

    const formData: FormModel = {
      ...DEFAULT_VALUES,
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      usePhases: recipeAdapter.hasPhases,
    };

    this.ingredientData.setItems(ingredientItems);
    this.form.setValue(formData);
  }

  private getMode(): EditMode {
    const id = this.getCurrentId();
    if (id) {
      return 'edit';
    }

    return 'new';
  }

  private getData(): FormModel {
    const model = this.form.value;
    return model as FormModel;
  }
}

/* Helper Functions */

function toRecipeIngredientPayload(
  item: RecipeItem,
  phase: string | undefined = ''
): RecipeIngredientPayloadItem {
  return {
    ingredientName: item.ingredient.name,
    amount: item.amount,
    unit: item.unit,
    phase,
  };
}

/* Helper class: RecipeDataAdapter */

type IngredientData = ItemWithOrdinal<RecipeIngredientPayloadItem> & {
  key: string | undefined;
};

class IngredientDataAdapter {
  private _items: IngredientData[] = [];
  private _phases: string[] = [];

  get items(): IngredientData[] {
    return this._items;
  }

  get itemsWithoutPhases() {
    return this._items.filter((it) => !it.phase);
  }
  get lastItem() {
    return this._items.length > 0
      ? this._items[this._items.length - 1]
      : undefined;
  }

  get phases(): string[] {
    return this._phases;
  }

  get hasPhases(): boolean {
    return this._phases.length > 0;
  }

  addItem(item: RecipeIngredientPayloadItem) {
    if (item.phase && !this._phases.includes(item.phase)) {
      this._phases.push(item.phase);
    }

    const existingItem = this._items.find((it) => isEqual(it, item));
    if (existingItem) {
      // merge
      existingItem.amount += item.amount;
      existingItem.key = toHash(existingItem);
      return;
    }

    const data = {
      ...item,
      phase: item.phase ?? undefined,
      ordinal: this._items.length + 1,
    };

    this._items.push({ ...data, key: toHash(data) });
  }

  updateItem(
    existingValue: RecipeIngredientPayloadItem,
    newValue: RecipeIngredientPayloadItem
  ) {
    const index = this._items.findIndex((it) => isEqual(it, existingValue));
    if (index < 0) {
      console.debug(
        'update item called without matching existing value. existingItem:',
        existingValue,
        'newItem:',
        newValue
      );
      return;
    }

    const existingItem = this._items[index];
    const data = {
      ...newValue,
      ordinal: existingItem.ordinal,
    };

    this._items[index] = { ...data, key: toHash(data) };
  }

  deleteItem(item: RecipeIngredientPayloadItem) {
    if (!item) {
      return;
    }

    if (remove(this._items, (it) => isEqual(it, item)).length > 0) {
      this.refreshOrdinalNumbers();
    }
  }

  moveItem(
    item: IngredientData,
    targetPhase: string | undefined,
    offsetFromStart: number
  ) {
    const currentIndex = this._items.findIndex((it) => it.key === item.key);
    const offset = offsetFromStart < 0 ? 0 : offsetFromStart;

    if (currentIndex < 0) {
      return;
    }

    if (!this.hasPhases) {
      if (currentIndex === offset) {
        return;
      }

      moveItemInArray(this._items, currentIndex, offset);
    } else {
      const phaseStartIndex = this._items.findIndex(
        (it) => it.phase === targetPhase
      );

      if (phaseStartIndex < 0) {
        if (currentIndex === 0) {
          return;
        }

        moveItemInArray(this._items, currentIndex, 0);
      } else {
        // include diminishing one position if the rest of the list will be shifted one up (as the source item is removed from above the target)
        const newIndex =
          phaseStartIndex + offset - (currentIndex < phaseStartIndex ? 1 : 0);

        if (currentIndex === newIndex) {
          if (this.hasPhases) {
            // case: only phase was changed, but the index position remains the same
            this.updatePhaseByKey(item.key, targetPhase);
          }
          return;
        }

        moveItemInArray(this._items, currentIndex, newIndex);
      }
    }

    if (this.hasPhases) {
      this.updatePhaseByKey(item.key, targetPhase);
    }

    this.refreshOrdinalNumbers();
  }

  setItems(items: RecipeIngredientPayloadItem[]) {
    this._items = [];
    this._phases = [];

    items.forEach((it) => {
      this.addItem(it);
    });

    this.refreshOrdinalNumbers();
  }

  getItemsByPhase(phase: string) {
    return this._items.filter((it) => it.phase === phase);
  }

  addPhase(phase: string) {
    if (!phase || this._phases.includes(phase)) {
      return;
    }

    this._phases.push(phase);
  }

  applyDefaultPhase() {
    if (!this.hasPhases) {
      return;
    }

    const defaultPhase = this._phases[this.phases.length - 1];
    this._items.forEach((it) => {
      if (!it.phase) {
        it.phase = defaultPhase;
      }
    });
  }

  deletePhase(phase: string) {
    if (!phase || this.isPhaseInUse(phase)) {
      return;
    }

    const index = this._phases.findIndex((it) => it === phase);
    if (index >= 0) {
      this._phases.splice(index, 1);
    }
  }

  movePhase(previousIndex: number, newIndex: number) {
    moveItemInArray(this._phases, previousIndex, newIndex);

    // sort ingredient items based on phase order to allow drag & drop order to work based on index numbers
    this.refreshOrdinalNumbers();
  }

  hasPhase(phase?: string): boolean {
    return !!phase && this._phases.findIndex((it) => it === phase) >= 0;
  }

  isPhaseInUse(phase?: string): boolean {
    if (!phase) {
      return false;
    }

    return this._items.findIndex((it) => it.phase === phase) < 0;
  }

  /* Helper Methods */
  private getItemsSortedByPhase(items: RecipeIngredientPayloadItem[]) {
    return chain(items)
      .sortBy((it) => this._phases.findIndex((phase) => phase === it.phase))
      .map((it, index) => ({ ...it, ordinal: index + 1 }))
      .map((it) => ({ ...it, key: toHash(it) }))
      .value();
  }

  private refreshOrdinalNumbers() {
    this._items = this.getItemsSortedByPhase(this._items);
  }

  private updatePhaseByKey(
    key: string | undefined,
    newPhase: string | undefined
  ) {
    if (!key) {
      return;
    }

    const targetItemIndex = this._items.findIndex((it) => it.key === key);
    if (targetItemIndex < 0) {
      return;
    }

    const targetItem = this.items[targetItemIndex];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { key: _, ...existingDataWithoutKey } = targetItem;
    const data = { ...existingDataWithoutKey, phase: newPhase };

    this.items[targetItemIndex] = {
      ...data,
      key: toHash(data),
    };
  }
}
