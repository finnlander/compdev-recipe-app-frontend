import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RootState } from '../../../store/app.store';
import { Recipe } from '../../models/recipe.model';
import { recipeActions, recipeSelectors } from '../../store';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.css'],
})
export class RecipeItemComponent implements OnInit {
  @Input() recipe?: Recipe;
  isSelected$: Observable<boolean> = of(false);

  constructor(private store: Store<RootState>) {}

  ngOnInit(): void {
    this.isSelected$ = this.store
      .select(recipeSelectors.getSelectedRecipe)
      .pipe(map((selected) => selected?.id === this.recipe?.id));
  }

  onSelect() {
    this.store.dispatch(
      recipeActions.setSelectedRecipe({
        id: this.recipe?.id || null,
      })
    );
  }
}
