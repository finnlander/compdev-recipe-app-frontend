import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutePath } from './app-routing.module';
import { AuthService } from './auth/services/auth.service';
import { RecipeService } from './recipes/services/recipe.service';
import { SubscribingComponent } from './shared/classes/subscribing-component';
import { DataStorageService } from './shared/services/data-storage.service';
import { ShoppingListService } from './shopping-list/services/shopping-list.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends SubscribingComponent implements OnInit {
  private loggedIn = false;

  constructor(
    private authService: AuthService,
    private dataStorageService: DataStorageService,
    private recipeService: RecipeService,
    private shoppingListService: ShoppingListService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
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
  }

  /* Lifecycle methods */

  private onLogin() {
    console.debug('onLogin');
    this.dataStorageService.loadRecipes();
  }

  private onLogout() {
    console.debug('onLogout');
    this.shoppingListService.clearAll();
    this.recipeService.setRecipes([]);
    this.recipeService.setSelectedRecipe();

    this.router.navigate([RoutePath.Auth], {
      queryParams: { logout: true },
    });
  }
}
