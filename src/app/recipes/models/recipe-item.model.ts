import { Ingredient } from '../../shared/models/ingredient.model';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';

export class RecipeItem {
  constructor(
    public ordinal: number,
    public ingredient: Ingredient,
    public amount: number,
    public unit: RecipeUnit
  ) {}
}
