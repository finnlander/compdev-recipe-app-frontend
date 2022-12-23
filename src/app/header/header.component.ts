import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RoutePath } from '../app-routing.module';
import { ShoppingListService } from '../shopping-list/services/shopping-list.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed: boolean = false;
  shoppingListCount: number = 0;
  Routes = RoutePath;

  private shoppingListChangeSubscription?: Subscription;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit(): void {
    this.shoppingListCount = this.shoppingListService.getCount();
    this.shoppingListChangeSubscription =
      this.shoppingListService.shoppingListChanged.subscribe(
        (items) => (this.shoppingListCount = items.length)
      );
  }

  ngOnDestroy(): void {
    this.shoppingListChangeSubscription?.unsubscribe();
  }
}
