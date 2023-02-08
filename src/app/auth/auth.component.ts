import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import {
  AlertDialogComponent,
  AlertDialogData,
} from '../shared/components/alert-dialog/alert-dialog.component';
import { ToastService } from '../shared/services/toast.service';
import { RootState } from '../store/app.store';
import { authActions, authSelectors as selectors } from './store';

/* Type Definitions */
type FormMode = 'login' | 'signup';

interface FormModel {
  username: string;
  password: string;
  repeatPassword?: string;
}

interface AuthOperationDetails {
  title: string;
  successMessage: string;
  errorMessagePrefix: string;
}

const SIGN_UP_DETAILS: AuthOperationDetails = {
  title: 'Sign Up',
  successMessage: 'Signed up and logged in successfully',
  errorMessagePrefix: 'Signup failed',
};

const LOGIN_DETAILS: AuthOperationDetails = {
  title: 'Login',
  successMessage: 'Logged in successfully',
  errorMessagePrefix: 'Login failed',
};

/**
 * Authentication form component.
 */
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent extends SubscribingComponent implements OnInit {
  formMode: FormMode = 'login';
  submitted = false;

  loggedOut = false;
  returnUrl?: string;

  loading$: Observable<boolean> = of(false);

  @ViewChild('form') form?: NgForm;

  constructor(
    private toastService: ToastService,
    private store: Store<RootState>,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.route.queryParams.subscribe((queryParams) => {
        this.returnUrl = queryParams['returnUrl'];
        this.loggedOut = !!queryParams['logout'];
      })
    );

    this.addSubscription(
      this.store.select(selectors.isAuthenticated).subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          setTimeout(() => this.onLoggedIn(), 0);
        }
      })
    );

    this.addSubscription(
      this.store.select(selectors.getAuthError).subscribe((error) => {
        if (error) {
          this.showError(error);
        }
      })
    );

    this.loading$ = this.store.select(selectors.isPendingAuthentication);
  }

  onSubmit() {
    if (!this.form) {
      console.error('Unexpected error: authentication form not initialized');
      return;
    }

    const model = this.form.value as FormModel;

    this.submitted = true;
    this.loggedOut = false;

    const action =
      this.formMode === 'login'
        ? authActions.loginRequest(model)
        : authActions.signupRequest(model);

    this.store.dispatch(action);
  }

  switchFormMode() {
    if (this.formMode === 'login') {
      this.formMode = 'signup';
    } else {
      this.formMode = 'login';
    }
  }

  getErrorMessage(field?: AbstractControl<unknown, unknown>) {
    if (!field) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Please enter a valid value.';
    }

    if (field.hasError('email')) {
      return 'Please enter a valid email.';
    }

    if (field.hasError('minlength')) {
      const err = field.getError('minlength');
      const requiredLength = err.requiredLength as number;
      return `Please provide a value that is at least ${requiredLength} character(s) long.`;
    }

    if (field.errors) {
      console.debug('errors: ', field.errors);
    }

    return '';
  }

  /* Helper Methods */

  private showError(error: string) {
    const data: AlertDialogData = {
      type: 'error',
      action: this.formMode === 'login' ? 'Login' : 'Sign Up',
      message: error,
    };

    const dialogRef = this.dialog.open(AlertDialogComponent, {
      data,
    });

    this.addSubscription(
      dialogRef.afterClosed().subscribe(() => {
        this.store.dispatch(authActions.clearError());
      })
    );
  }

  private showSuccessFeedback() {
    const details = this.formMode === 'login' ? LOGIN_DETAILS : SIGN_UP_DETAILS;
    this.toastService.success({
      title: details.title,
      message: details.successMessage,
    });
  }

  private onLoggedIn() {
    if (this.loggedOut) {
      // hide logged out message.
      this.loggedOut = false;
    }

    if (this.submitted) {
      this.showSuccessFeedback();
      this.submitted = false;
    }

    if (this.returnUrl) {
      this.router.navigate([this.returnUrl], { relativeTo: this.route });
    } else {
      this.router.navigate(['/'], { relativeTo: this.route });
    }
  }
}
