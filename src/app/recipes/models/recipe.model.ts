import { sumBy } from 'lodash';
import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  phases: RecipePhase[];
}

/**
 * A single preparation phase on recipe.
 */
export interface RecipePhase {
  name: string;
  items: RecipeItem[];
}

/**
 * Single item of a recipe.
 */
export interface RecipeItem {
  ordinal: number;
  ingredient: Ingredient;
  amount: number;
  unit: RecipeUnit;
}

/**
 * Adapter for easier recipe management.
 */
export class RecipeAdapter {
  constructor(private recipe: Recipe) {}

  get items() {
    return this.recipe.phases.flatMap((it) => it.items);
  }

  get size() {
    return sumBy(this.recipe.phases, (it) => it.items.length);
  }

  get hasPhases(): boolean {
    return (
      this.recipe.phases.length > 1 ||
      this.recipe.phases.findIndex((it) => !!it.name) >= 0
    );
  }

  get phaseNames(): string[] {
    return this.recipe.phases.map((it) => it.name).filter((it) => !!it);
  }

  addIngredient(
    ingredient: Ingredient,
    amount: number,
    unit: RecipeUnit = RecipeUnit.PCS,
    phaseName = ''
  ): RecipeAdapter {
    const phase = this.getOrAddPhase(phaseName);
    const ordinal = this.size + 1;
    const item: RecipeItem = { ordinal, ingredient, amount, unit };

    phase.items.push(item);

    return this;
  }

  clearItems() {
    this.recipe.phases = [];
  }

  getItemsWithPhaseName(): (RecipeItem & { phase: string | undefined })[] {
    return this.recipe.phases.flatMap((it) =>
      it.items.map((item) => ({
        ...item,
        phase: it.name ? it.name : undefined,
      }))
    );
  }

  /* Helper Methods */
  private getOrAddPhase(name: string) {
    const existingPhase = this.recipe.phases.find((it) => it.name === name);
    if (existingPhase) return existingPhase;

    const phase: RecipePhase = {
      name: name,
      items: [],
    };
    this.recipe.phases.push(phase);
    return phase;
  }
}
