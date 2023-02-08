import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment } from '../environments/environment';
import { authActions, authSelectors } from './auth/store';
import { RoutePath } from './config/routes.config';
import { recipeActions } from './recipes/store';
import { SubscribingComponent } from './shared/classes/subscribing-component';
import { IngredientService } from './shared/services/ingredient.service';
import { shoppingListActions } from './shopping-list/store';
import { RootState } from './store/app.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends SubscribingComponent implements OnInit {
  private loggedIn = false;

  constructor(
    private router: Router,
    private store: Store<RootState>,
    private ingredientsService: IngredientService
  ) {
    super();
  }

  ngOnInit(): void {
    console.debug('Env: ', environment);

    this.addSubscription(
      this.store
        .select(authSelectors.isAuthenticated)
        .subscribe((isLoggedIn) => {
          if (isLoggedIn === this.loggedIn) {
            return;
          }

          this.loggedIn = isLoggedIn;
          if (isLoggedIn) {
            this.onLogin();
          } else {
            this.onLogout();
          }
        })
    );

    // resume session, if available
    this.store.dispatch(authActions.restoreSession());
    this.store.dispatch(shoppingListActions.loadStoredItemsRequest());
  }

  /* Lifecycle methods */

  private onLogin() {
    console.debug('onLogin initiated');
    this.store.dispatch(recipeActions.fetchRecipesRequest());
    this.ingredientsService.loadIngredients();
  }

  private onLogout() {
    console.debug('onLogout initiated');

    this.store.dispatch(shoppingListActions.clearItems());

    this.router.navigate([RoutePath.Auth], {
      queryParams: { logout: true },
    });
  }
}
