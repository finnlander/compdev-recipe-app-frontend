import { RecipeItem } from './recipe-item.model';

export class RecipePhase {
  constructor(public name: string, public items: RecipeItem[] = []) {}

  addItem(item: RecipeItem): RecipePhase {
    this.items.push(item);
    return this;
  }
}
