import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { RoutePath } from '../config/routes.config';
import { RecipeService } from '../recipes/services/recipe.service';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import { ConfirmationType } from '../shared/models/confirmation.types';
import { DataStorageService } from '../shared/services/data-storage.service';
import { ModalService } from '../shared/services/modal.service';
import { ToastService } from '../shared/services/toast.service';
import { shoppingListSelectors } from '../shopping-list/store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent extends SubscribingComponent implements OnInit {
  collapsed: boolean = false;
  isLoggedIn: boolean = false;
  shoppingListCount: Observable<number> = of(0);
  Routes = RoutePath;

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService,
    private dataStorageService: DataStorageService,
    private modalService: ModalService,
    private toastService: ToastService,
    private store: Store
  ) {
    super();
  }

  ngOnInit(): void {
    this.shoppingListCount = this.store.select(
      shoppingListSelectors.getShoppingListCount
    );
    this.isLoggedIn = this.authService.isLoggedIn();

    this.addSubscription(
      this.authService.loginChange.subscribe(
        (isLoggedIn) => (this.isLoggedIn = isLoggedIn)
      )
    );
  }

  onLogout() {
    this.authService.logout();
  }

  onSaveData() {
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.PROCEED_CONFIRMATION,
      itemDescription: 'saving recipes',
      removeQuotes: true,
      onConfirmYes: () => {
        this.dataStorageService.storeRecipes().subscribe(
          () => {
            this.toastService.success({
              title: 'Stored successfully',
              message: 'Recipes stored successfully.',
            });
          },
          (error: HttpErrorResponse) => {
            this.toastService.error({
              title: 'Storing failed',
              message: 'Storing recipes failed on error: ' + error.message,
            });
          }
        );
      },
    });
  }

  onLoadData() {
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.PROCEED_CONFIRMATION,
      itemDescription: 'loading recipes',
      removeQuotes: true,
      onConfirmYes: () => {
        this.dataStorageService.loadRecipes(true).subscribe(
          () => {
            this.recipeService.setSelectedRecipe();
            this.toastService.success({
              title: 'Loaded successfully',
              message: 'Recipes loaded successfully.',
            });
          },
          (error: string) => {
            console.log('API error: ', error);
            this.toastService.error({
              title: 'Loading failed',
              message: 'Loading recipes failed on error: ' + error,
            });
          }
        );
      },
    });
  }
}
