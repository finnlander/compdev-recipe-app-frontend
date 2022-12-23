import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShoppingListItem } from './models/shopping-list-item-model';
import { ShoppingListService } from './services/shopping-list.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  items: ShoppingListItem[] = [];
  changeSubscription?: Subscription;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit(): void {
    // Add some samples
    if (this.shoppingListService.getCount() == 0) {
      this.shoppingListService.generateSampleData();
    }

    this.changeSubscription =
      this.shoppingListService.shoppingListChanged.subscribe(
        (updatedItems) => (this.items = updatedItems)
      );

    this.items = this.shoppingListService.getItems();
  }

  ngOnDestroy(): void {
    this.changeSubscription?.unsubscribe();
  }
}
