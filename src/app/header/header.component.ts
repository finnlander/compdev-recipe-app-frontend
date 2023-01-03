import { Component, OnInit } from '@angular/core';
import { RoutePath } from '../app-routing.module';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import { ShoppingListService } from '../shopping-list/services/shopping-list.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent extends SubscribingComponent implements OnInit {
  collapsed: boolean = false;
  shoppingListCount: number = 0;
  Routes = RoutePath;

  constructor(private shoppingListService: ShoppingListService) {
    super();
  }

  ngOnInit(): void {
    this.shoppingListCount = this.shoppingListService.getCount();
    this.addSubscription(
      this.shoppingListService.shoppingListChanged.subscribe(
        (items) => (this.shoppingListCount = items.length)
      )
    );
  }
}
