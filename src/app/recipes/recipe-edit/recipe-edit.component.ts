import { Component, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { first } from 'lodash';
import { IdPathTrackingComponent } from '../../shared/classes/id-path-tracking-component';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../../shared/models/confirmation.types';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { ModalService } from '../../shared/services/modal.service';
import { RecipeItem } from '../models/recipe-item.model';
import { Recipe } from '../models/recipe.model';
import {
  DEFAULT_RECIPE_IMG,
  RecipeData,
  RecipeIngredientData,
  RecipeService,
} from '../services/recipe.service';

/* Types */

type EditMode = 'new' | 'edit';
type FormModel = RecipeData & {
  usePhases: boolean;
  newPhaseName: string;
  phases: string[];
};

/* Default value initializations */

const DEFAULT_VALUES: FormModel = {
  name: '',
  description: '',
  imageUrl: DEFAULT_RECIPE_IMG,
  ingredientItems: [],
  usePhases: false,
  newPhaseName: '',
  phases: [],
};

const DEFAULT_INGREDIENT_VALUES: RecipeIngredientData = {
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
  implements OnInit
{
  iconDelete = faTrashCan;
  iconAdd = faPlus;
  RecipeUnit = RecipeUnit;
  selectedRecipe?: Recipe;
  mode: EditMode = 'new';

  form: FormGroup<any>;

  constructor(
    route: ActivatedRoute,
    private recipeService: RecipeService,
    private modalService: ModalService,
    private router: Router,
    private fb: FormBuilder
  ) {
    super(route);
    this.form = RecipeEditComponent.createForm(fb);
  }

  get ingredientItems() {
    return this.form.controls['ingredientItems'] as FormArray<FormGroup>;
  }

  get usePhases(): boolean {
    return this.form.controls['usePhases'].value;
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

    const model = this.getData()!!;
    const data = { ...model, imageUrl: model.imageUrl || DEFAULT_RECIPE_IMG };

    if (this.mode === 'new') {
      this.recipeService.addRecipe(data);
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }

    if (!this.selectedRecipe) {
      return;
    }

    this.recipeService.update(this.selectedRecipe.id, data);

    this.router.navigate(['../'], { relativeTo: this.route });
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
      onConfirmationResult: (res) => {
        if (res == ConfirmationResult.YES) {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
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

  onAddIngredient(initialValue?: RecipeIngredientData) {
    const input = initialValue || DEFAULT_INGREDIENT_VALUES;
    const { phases } = this.getData();

    const prevIngredient = this.ingredientItems.value
      .slice(-1)
      .pop() as RecipeIngredientData;

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
    const value: RecipeIngredientData = item.value;

    if (!value.ingredientName) {
      this.handleDeleteIngredient(index);
      return;
    }

    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.DELETE,
      itemDescription: `"${value.ingredientName}" ingredient`,
      removeQuotes: true,
      onConfirmationResult: (res) => {
        if (res == ConfirmationResult.YES) {
          this.handleDeleteIngredient(index);
        }
      },
    });
  }

  onCurrentIdChanged(currentId: number | undefined): void {
    this.mode = this.getMode();
    if (currentId === this.selectedRecipe?.id) {
      return;
    }

    const selectedRecipe = currentId
      ? this.recipeService.getRecipeById(currentId)
      : undefined;

    this.onSelectedRecipeChanged(currentId, selectedRecipe);
  }

  /* Helper Methods */
  private static createForm(fb: FormBuilder): FormGroup<any> {
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

  private onSelectedRecipeChanged(id: number | undefined, recipe?: Recipe) {
    if (this.mode === 'edit' && !recipe) {
      console.warn(
        'Selected non-existing recipe #' + id + ' -> navigating to parent path'
      );
      this.router.navigate(['../'], { relativeTo: this.route });
    }

    this.selectedRecipe = recipe;
    this.syncFieldsFrom(recipe);
  }

  private syncFieldsFrom(recipe?: Recipe) {
    this.ingredientItems.clear();
    this.phases.clear();

    if (!recipe) {
      return;
    }

    const usePhases = recipe.phases.length > 1;
    const phaseNames = recipe.phases.map((it) => it.name).filter((it) => !!it);

    const ingredientItems = recipe.phases.flatMap((phase) =>
      phase.items.map((item) => toRecipeIngredientData(item, phase.name))
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

function toRecipeIngredientData(
  item: RecipeItem,
  phase: string = ''
): RecipeIngredientData {
  return {
    ingredientName: item.ingredient.name,
    amount: item.amount,
    unit: item.unit,
    phase: phase,
  };
}
