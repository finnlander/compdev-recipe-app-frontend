import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, skipWhile, take } from 'rxjs/operators';
import { authActions, authSelectors } from '../auth/store';
import { RoutePath } from '../config/routes.config';
import { recipeActions, recipeSelectors } from '../recipes/store';
import { ConfirmationType } from '../shared/models/confirmation.types';
import { ModalService } from '../shared/services/modal.service';
import { ToastService } from '../shared/services/toast.service';
import { shoppingListSelectors } from '../shopping-list/store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  collapsed: boolean = false;
  isLoggedIn$: Observable<boolean> = of(false);
  shoppingListCount$: Observable<number> = of(0);
  Routes = RoutePath;

  constructor(
    private modalService: ModalService,
    private toastService: ToastService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.shoppingListCount$ = this.store.select(
      shoppingListSelectors.getShoppingListCount
    );
    this.isLoggedIn$ = this.store.select(authSelectors.isAuthenticated);
  }

  onLogout() {
    this.store.dispatch(authActions.logout({}));
  }

  onSaveData() {
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.PROCEED_CONFIRMATION,
      itemDescription: 'saving recipes',
      removeQuotes: true,
      onConfirmYes: () => {
        this.store.dispatch(recipeActions.storeRecipesRequest());
        this.store
          .select(recipeSelectors.getLoadingAndError)
          .pipe(
            skipWhile((it) => it.loading),
            map((it) => it.error),
            take(1)
          )
          .subscribe((error) => {
            if (error) {
              this.toastService.error({
                title: 'Storing failed',
                message: 'Storing recipes failed on error: ' + error,
              });
            } else {
              this.toastService.success({
                title: 'Stored successfully',
                message: 'Recipes stored successfully.',
              });
            }
          });
      },
    });
  }

  onLoadData() {
    this.modalService.handleConfirmation({
      confirmationType: ConfirmationType.PROCEED_CONFIRMATION,
      itemDescription: 'loading recipes',
      removeQuotes: true,
      onConfirmYes: () => {
        this.store.dispatch(recipeActions.fetchRecipesRequest());
        this.store
          .select(recipeSelectors.getLoadingAndError)
          .pipe(
            skipWhile((it) => it.loading),
            map((it) => it.error),
            take(1)
          )
          .subscribe((error) => {
            if (error) {
              this.toastService.error({
                title: 'Loading failed',
                message: 'Loading recipes failed on error: ' + error,
              });
            } else {
              this.toastService.success({
                title: 'Loaded successfully',
                message: 'Recipes loaded successfully.',
              });
            }
          });
      },
    });
  }
}
