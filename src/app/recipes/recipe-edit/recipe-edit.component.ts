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
import { isEqual, remove } from 'lodash';
import { Observable, of } from 'rxjs';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import { ConfirmationType } from '../../shared/models/confirmation.types';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { RootState } from '../../store/app.store';
import { Recipe, RecipeItem } from '../models/recipe.model';
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
  phases: string[];
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
  phases: [],
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
  ingredientItems: RecipeIngredientPayloadItem[] = [];

  constructor(
    route: ActivatedRoute,
    private modalService: ModalService,
    private toastService: ToastService,
    private router: Router,
    private store: Store<RootState>,
    private fb: FormBuilder,
    private actions$: Actions,
    private dialog: MatDialog
  ) {
    super(route);
    this.form = RecipeEditComponent.createForm(fb);
  }

  get usePhases(): boolean {
    return this.form.controls['usePhases'].value || false;
  }

  get phases() {
    return this.form.controls['phases'] as FormArray<FormControl>;
  }

  get ingredientsWithoutPhases() {
    return this.ingredientItems.filter((it) => !it.phase);
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
    const { newPhaseName, phases } = this.getData();
    return !!newPhaseName && !phases.find((it) => it === newPhaseName);
  }

  canDeletePhase(phaseName: string): boolean {
    return this.ingredientItems.findIndex((it) => it.phase === phaseName) == -1;
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
      ingredientItems: this.ingredientItems.map((it) => {
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
    const isFirst = this.phases.length === 0;
    const { newPhaseName } = this.getData();
    this.addPhase(newPhaseName);

    if (isFirst) {
      this.ingredientItems = this.ingredientItems.map((it) => ({
        ...it,
        phase: newPhaseName,
      }));
    }

    this.form.patchValue({ newPhaseName: '' });
  }

  onDeletePhase(index: number) {
    this.phases.removeAt(index);
  }

  onAddOrEditIngredient(initialValue?: RecipeIngredientPayloadItem) {
    const mode: 'new' | 'edit' = initialValue ? 'edit' : 'new';
    const prevIngredient = this.ingredientItems.slice(-1).pop();

    const phases = (this.form.value.phases || []) as string[];
    const data: IngredientEditDialogData = {
      usePhases: this.usePhases,
      phases,
      defaultPhase: prevIngredient?.phase,
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
        if (mode === 'new') {
          this.ingredientItems.push(res.ingredient);
        } else {
          this.ingredientItems = this.ingredientItems.map((it) => {
            if (isEqual(it, initialValue)) {
              return res.ingredient;
            } else {
              return it;
            }
          });
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
    moveItemInArray(
      this.phases.controls,
      event.previousIndex,
      event.currentIndex
    );

    this.phases.updateValueAndValidity();
  }

  getIngredientItems(phase: unknown): RecipeIngredientPayloadItem[] {
    return this.ingredientItems.filter((it) => it.phase === phase);
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
      phases: fb.array([], { ...defaultFieldOptions }),
    });
  }

  private addPhase(phaseName: string) {
    const defaultFieldOptions: AbstractControlOptions = {
      updateOn: 'change',
    };
    const phaseControl = this.fb.control(phaseName, defaultFieldOptions);
    this.phases.push(phaseControl);
  }

  private handleDeleteIngredient(item: RecipeIngredientPayloadItem) {
    remove(this.ingredientItems, (it) => isEqual(it, item));
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
    this.ingredientItems = [];
    this.phases.clear();

    if (!recipe) {
      return;
    }

    const usePhases =
      recipe.phases.length > 1 ||
      recipe.phases.findIndex((it) => !!it.name) >= 0;

    const phaseNames = recipe.phases.map((it) => it.name).filter((it) => !!it);

    const ingredientItems = recipe.phases.flatMap((phase) =>
      phase.items.map((item) => toRecipeIngredientPayload(item, phase.name))
    );

    const formData: FormModel = {
      ...DEFAULT_VALUES,
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      usePhases,
      phases: phaseNames,
    };

    phaseNames.forEach((it) => this.addPhase(it));
    this.ingredientItems = ingredientItems;

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
  phase = ''
): RecipeIngredientPayloadItem {
  return {
    ingredientName: item.ingredient.name,
    amount: item.amount,
    unit: item.unit,
    phase: phase,
  };
}
