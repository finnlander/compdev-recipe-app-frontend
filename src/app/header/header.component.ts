import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, Observable, of, shareReplay } from 'rxjs';
import { authActions, authSelectors } from '../auth/store';
import { RoutePath } from '../config/routes.config';
import { reactOnRecipesActionResult } from '../recipes/recipes-util';
import { recipeActions } from '../recipes/store';
import { ConfirmationType } from '../shared/models/confirmation.types';
import { ModalService } from '../shared/services/modal.service';
import { ToastProps, ToastService } from '../shared/services/toast.service';
import { shoppingListSelectors } from '../shopping-list/store';

/* Constants */

const ON_RECIPES_LOADED_SUCCESS_PROPS: ToastProps = {
  title: 'Loaded successfully',
  message: 'Recipes loaded successfully.',
};

const ON_RECIPES_STORED_SUCCESS_PROPS: ToastProps = {
  title: 'Stored successfully',
  message: 'Recipes stored successfully.',
};

/* Class component */

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn$: Observable<boolean> = of(false);
  shoppingListCount$: Observable<number> = of(0);
  Routes = RoutePath;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private modalService: ModalService,
    private toastService: ToastService,
    private store: Store,
    private actions$: Actions,
    private breakpointObserver: BreakpointObserver
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

        reactOnRecipesActionResult(this.actions$, {
          successAction: recipeActions.storeRecipesSuccess,
          onSuccess: () =>
            this.toastService.success(ON_RECIPES_STORED_SUCCESS_PROPS),
          onFailure: (error) =>
            this.toastService.error(getStoringRecipesFailedToastProps(error)),
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
        reactOnRecipesActionResult(this.actions$, {
          successAction: recipeActions.fetchRecipesSuccess,
          onSuccess: () =>
            this.toastService.success(ON_RECIPES_LOADED_SUCCESS_PROPS),
          onFailure: (error) =>
            this.toastService.error(getLoadingRecipesFailedToastProps(error)),
        });
      },
    });
  }
}

/* Helper Methods */

function getLoadingRecipesFailedToastProps(error: string): ToastProps {
  return {
    title: 'Loading failed',
    message: 'Loading recipes failed on error: ' + error,
  };
}

function getStoringRecipesFailedToastProps(error: string): ToastProps {
  return {
    title: 'Storing failed',
    message: 'Storing recipes failed on error: ' + error,
  };
}
