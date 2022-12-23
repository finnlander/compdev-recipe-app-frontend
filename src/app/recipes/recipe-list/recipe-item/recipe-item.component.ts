import { Component, Input, OnInit } from '@angular/core';
import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.css'],
})
export class RecipeItemComponent implements OnInit {
  @Input() recipe?: Recipe;
  @Input() isSelected: boolean = false;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {}

  onSelect() {
    this.recipeService.setSelectedRecipe(this.recipe);
  }
}
