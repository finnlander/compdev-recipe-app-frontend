import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, timer } from 'rxjs';
import { SubscribingComponent } from '../shared/classes/subscribing-component';
import { User } from '../shared/models/user.model';
import { LoadingService } from '../shared/services/loading.service';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './services/auth.service';

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
  loggedOut = false;
  loading: boolean = false;
  returnUrl?: string;
  error?: string;

  @ViewChild('form') form?: NgForm;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService
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
      timer(100).subscribe(() => {
        if (this.authService.isLoggedIn()) {
          // navigate to home
          this.router.navigate(['/'], { relativeTo: this.route });
        }
      })
    );
  }

  onSubmit() {
    const model = this.form!!.value as FormModel;
    this.error = undefined;
    this.loggedOut = false;
    this.loading = true;
    this.loadingService.showSpinner();

    const subscription =
      this.formMode === 'login'
        ? this.authService.login(model)
        : this.authService.signup(model);

    const details = this.formMode === 'login' ? LOGIN_DETAILS : SIGN_UP_DETAILS;
    this.handleAuthentication(subscription, details);

    this.form!!.reset();
  }

  onClearError() {
    this.error = undefined;
  }

  switchFormMode() {
    if (this.formMode === 'login') {
      this.formMode = 'signup';
    } else {
      this.formMode = 'login';
    }
  }
  /* Helper Methods */

  private handleAuthentication(
    subscription: Observable<User | undefined>,
    details: AuthOperationDetails
  ) {
    subscription.subscribe(
      (user) => {
        if (!user) {
          this.onAuthenticationAttemptEndedWithError(
            'authentication failed',
            details
          );
          return;
        }

        this.onAuthenticationAttemptEnded();

        this.toastService.success({
          title: details.title,
          message: details.successMessage,
        });

        this.onLoggedIn();
      },
      (error: string) => {
        this.onAuthenticationAttemptEndedWithError(error, details);
      }
    );
  }

  private onAuthenticationAttemptEndedWithError(
    error: string,
    details: AuthOperationDetails
  ) {
    this.onAuthenticationAttemptEnded();

    this.error = error;
    this.toastService.error({
      title: details.title,
      message: `${details.errorMessagePrefix}: ${this.error}`,
    });
    if (this.loggedOut) {
      // hide logged out message.
      this.loggedOut = false;
    }
  }

  private onAuthenticationAttemptEnded() {
    this.loading = false;
    this.loadingService.hideSpinner();
  }

  private onLoggedIn() {
    if (this.returnUrl) {
      this.router.navigate([this.returnUrl], { relativeTo: this.route });
    } else {
      this.router.navigate(['/'], { relativeTo: this.route });
    }
  }
}
