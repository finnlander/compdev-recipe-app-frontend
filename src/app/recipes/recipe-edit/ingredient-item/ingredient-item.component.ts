import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecipeIngredientPayloadItem } from '../../store';

/**
 * Ingredient list item component (part of recipe edit view).
 */
@Component({
  selector: 'app-ingredient-item',
  templateUrl: './ingredient-item.component.html',
  styleUrls: ['./ingredient-item.component.css'],
})
export class IngredientItemComponent {
  @Input() item!: RecipeIngredientPayloadItem;
  @Output() deleted = new EventEmitter<RecipeIngredientPayloadItem>();
  @Output() clicked = new EventEmitter<RecipeIngredientPayloadItem>();

  onClick() {
    this.clicked.emit(this.item);
  }
  onDelete(event: Event) {
    event.stopPropagation();
    this.deleted.emit(this.item);
    return false;
  }
}
