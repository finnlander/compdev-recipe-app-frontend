import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment } from '../environments/environment';
import { AuthService } from './auth/services/auth.service';
import { RoutePath } from './config/routes.config';
import { RecipeService } from './recipes/services/recipe.service';
import { SubscribingComponent } from './shared/classes/subscribing-component';
import { DataStorageService } from './shared/services/data-storage.service';
import { shoppingListActions } from './shopping-list/store';
import { RootState } from './store/app.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent extends SubscribingComponent implements OnInit {
  private loggedIn = false;

  constructor(
    private authService: AuthService,
    private dataStorageService: DataStorageService,
    private recipeService: RecipeService,
    private router: Router,
    private store: Store<RootState>
  ) {
    super();
  }

  ngOnInit(): void {
    console.debug('Env: ', environment);

    this.addSubscription(
      this.authService.loginChange.subscribe((isLoggedIn) => {
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
    this.authService.resume();
  }

  /* Lifecycle methods */

  private onLogin() {
    console.debug('onLogin initiated');
    this.dataStorageService.loadRecipes().subscribe();
  }

  private onLogout() {
    console.debug('onLogout initiated');

    this.store.dispatch(shoppingListActions.clearItems());

    this.recipeService.setRecipes([]);
    this.recipeService.setSelectedRecipe();

    this.router.navigate([RoutePath.Auth], {
      queryParams: { logout: true },
    });
  }
}
