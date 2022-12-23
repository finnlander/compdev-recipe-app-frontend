import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';
import { RecipeItem } from './recipe-item.model';
import { RecipePhase } from './recipe-phase.model';

export class Recipe {
  public phases: RecipePhase[] = [];
  public items: RecipeItem[] = [];

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public imagePath: string
  ) {}

  addIngredient(
    ingredient: Ingredient,
    amount: number,
    unit: RecipeUnit = RecipeUnit.PCS,
    phaseName: string = ''
  ): Recipe {
    const phase = this.getOrAddPhase(phaseName);
    const ordinal = this.items.length + 1;
    const item = new RecipeItem(ordinal, ingredient, amount, unit);
    this.items.push(item);
    phase.items.push(item);

    return this;
  }

  /* Helper Methods */
  private getOrAddPhase(name: string) {
    const existingPhase = this.phases.find((it) => it.name === name);
    if (existingPhase) return existingPhase;

    const phase = new RecipePhase(name);
    this.phases.push(phase);
    return phase;
  }
}
