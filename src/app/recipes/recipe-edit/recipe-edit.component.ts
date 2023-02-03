import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { first } from 'lodash';
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
  AddRecipePayload,
  recipeActions,
  RecipeIngredientPayloadItem,
  recipeSelectors,
} from '../store';

/* Types */

type EditMode = 'new' | 'edit';
type FormModel = AddRecipePayload & {
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
  ingredientItems: [],
  usePhases: false,
  newPhaseName: '',
  phases: [],
};

const DEFAULT_INGREDIENT_VALUES: RecipeIngredientPayloadItem = {
  ingredientName: '',
  amount: 1,
  unit: RecipeUnit.PCS,
  phase: '',
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
  iconDelete = faX;
  iconAdd = faPlus;
  RecipeUnit = RecipeUnit;
  selectedRecipe: Recipe | null = null;
  mode: EditMode = 'new';
  form: ReturnType<typeof RecipeEditComponent.createForm>;

  loading$: Observable<boolean> = of(false);

  constructor(
    route: ActivatedRoute,
    private modalService: ModalService,
    private toastService: ToastService,
    private router: Router,
    private store: Store<RootState>,
    private fb: FormBuilder,
    private actions$: Actions
  ) {
    super(route);
    this.form = RecipeEditComponent.createForm(fb);
  }

  get ingredientItems() {
    return this.form.controls[
      'ingredientItems'
    ] as unknown as FormArray<FormGroup>;
  }

  get usePhases(): boolean {
    return this.form.controls['usePhases'].value || false;
  }

  get phases() {
    return this.form.controls['phases'] as FormArray<FormControl>;
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
    const { ingredientItems } = this.getData();
    return ingredientItems.findIndex((it) => it.phase === phaseName) == -1;
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
    const data = { ...model, imageUrl: model.imageUrl || DEFAULT_RECIPE_IMG };

    const action = isNew
      ? recipeActions.addRecipeRequest(data)
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        recipeActions.updateRecipeRequest({ ...data, id: recipe!.id });

    const successAction = isNew
      ? recipeActions.addRecipeSuccess
      : recipeActions.updateRecipeSuccess;

    this.store.dispatch(action);
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

    let modelUpdate;
    if (!isFirst) {
      modelUpdate = { newPhaseName: '' };
    } else {
      const { ingredientItems } = this.getData();
      modelUpdate = {
        newPhaseName: '',
        ingredientItems: ingredientItems.map((it) => {
          return { ...it, phase: newPhaseName };
        }),
      };
    }

    this.form.patchValue(modelUpdate);
  }

  onDeletePhase(index: number) {
    this.phases.removeAt(index);
  }

  onAddIngredient(initialValue?: RecipeIngredientPayloadItem) {
    const input = initialValue || DEFAULT_INGREDIENT_VALUES;
    const { phases } = this.getData();

    const prevIngredient = this.ingredientItems.value
      .slice(-1)
      .pop() as RecipeIngredientPayloadItem;

    const phase = !this.usePhases
      ? ''
      : input.phase || prevIngredient?.phase || first(phases) || '';

    const model = {
      ...input,
      phase: phase,
    };

    const ingredientControl = this.fb.group({
      ingredientName: ['', Validators.required],
      amount: [1, { validators: [Validators.required, Validators.min(0.001)] }],
      unit: [RecipeUnit.PCS, Validators.required],
      phase: '',
    });

    ingredientControl.setValue(model);
    this.ingredientItems.push(ingredientControl);
  }

  onDeleteIngredient(index: number) {
    const item = this.ingredientItems.controls[index];
    const value: RecipeIngredientPayloadItem = item.value;

    if (!value.ingredientName) {
      this.handleDeleteIngredient(index);
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${value.ingredientName}" ingredient`,
      removeQuotes: true,
      onConfirmYes: () => this.handleDeleteIngredient(index),
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
      phases: fb.array([]),
      ingredientItems: fb.array([]),
    });
  }

  private addPhase(phaseName: string) {
    const phaseControl = this.fb.control(phaseName);
    this.phases.push(phaseControl);
  }

  private handleDeleteIngredient(index: number) {
    this.ingredientItems.removeAt(index);
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
    this.ingredientItems.clear();
    this.phases.clear();

    if (!recipe) {
      return;
    }

    const usePhases = recipe.phases.length > 1;
    const phaseNames = recipe.phases.map((it) => it.name).filter((it) => !!it);

    const ingredientItems = recipe.phases.flatMap((phase) =>
      phase.items.map((item) => toRecipeIngredientPayload(item, phase.name))
    );

    const formData: FormModel = {
      ...DEFAULT_VALUES,
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      ingredientItems: ingredientItems,
      usePhases,
      phases: phaseNames,
    };

    ingredientItems.forEach((it) => this.onAddIngredient(it));
    phaseNames.forEach((it) => this.addPhase(it));

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
