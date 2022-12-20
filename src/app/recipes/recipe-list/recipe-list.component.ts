import { Component } from '@angular/core';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent {
  recipes: Recipe[] = [
    new Recipe(
      'A sample recipe',
      'Sample recipe of a cassarolle',
      'https://cdn-icons-png.flaticon.com/512/3565/3565418.png'
    ),
    new Recipe(
      'A sample recipe',
      'Sample recipe of a cassarolle',
      'https://cdn-icons-png.flaticon.com/512/3565/3565418.png'
    ),
  ];
}
