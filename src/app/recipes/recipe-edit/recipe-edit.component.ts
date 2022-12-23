import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../services/recipe.service';

type EditMode = 'new' | 'edit';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  selectedRecipe?: Recipe;
  subscriptions: Subscription[] = [];
  newName: string = '';
  newDescription: string = '';
  mode: EditMode = 'new';

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mode = this.getMode(this.route.snapshot.params);

    this.subscriptions.push(
      this.recipeService.subscribeOnSelect((recipe) => {
        this.selectedRecipe = recipe;
        this.syncFieldsFrom(recipe);
      })
    );

    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.mode = this.getMode(params);

        const id = +params['id'];
        if (id !== this.selectedRecipe?.id) {
          this.recipeService.selectRecipeById(id);
        }
      })
    );

    if (this.mode === 'edit') {
      this.selectedRecipe = this.recipeService.getSelectedRecipe();
      this.syncFieldsFrom(this.selectedRecipe);
    } else {
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((it) => it.unsubscribe());
    this.subscriptions = [];
  }

  save() {
    if (this.mode === 'new') {
      this.recipeService.addRecipe(this.newName, this.newDescription);
      return;
    }

    if (!this.selectedRecipe) {
      return;
    }

    this.selectedRecipe.name = this.newName;
    this.selectedRecipe.description = this.newDescription;
    this.recipeService.save(this.selectedRecipe);

    this.router.navigate(['../'], { relativeTo: this.route });
  }

  isChanged(): boolean {
    return (
      !this.selectedRecipe ||
      this.newName !== this.selectedRecipe?.name ||
      this.newDescription !== this.selectedRecipe?.description
    );
  }

  private syncFieldsFrom(recipe?: Recipe) {
    if (!recipe) {
      return;
    }

    this.newName = recipe.name;
    this.newDescription = recipe.description;
  }

  private getMode(params: Params): EditMode {
    const id = +params['id'];
    if (id) {
      return 'edit';
    }

    return 'new';
  }
}
