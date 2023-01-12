import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { getApiUrl } from '../api-utils';
import { AuthRequest, AuthResponse } from '../model/authentication.model';

/**
 * A service to connect into authentication API.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private http: HttpClient) {}

  /**
   * Get currently authenticated user.
   */
  getAuthenticatedUser(): Observable<User> {
    const url = getApiUrl('users/me');
    return this.http
      .get<User>(url)
      .pipe(catchError(this.handleCurrentUserQueryError));
  }

  /**
   * Login user.
   */
  login(data: AuthRequest): Observable<AuthResponse> {
    const url = getApiUrl('auth/login');

    return this.http
      .post<AuthResponse>(url, data)
      .pipe(catchError(this.handleLoginError));
  }

  /**
   * Sign up with a new user ang get token to be used as a logged in user.
   */
  signup(data: AuthRequest): Observable<AuthResponse> {
    const url = getApiUrl('auth/signup');
    return this.http
      .post<AuthResponse>(url, data)
      .pipe(catchError(this.handleSignupError));
  }

  /* Helper Methods */

  private handleSignupError(error: HttpErrorResponse) {
    if (error.status === 409) {
      return throwError('username already exists');
    }
    console.error('Sign Up failed', error);
    return throwError(error.message);
  }

  private handleLoginError(error: HttpErrorResponse) {
    if (error.status === 403) {
      return throwError('invalid username or password');
    }

    console.error('Login failed', error);
    return throwError(error.message);
  }

  private handleCurrentUserQueryError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError('user not exist');
    }

    console.error('Current user query failed', error);
    return throwError(error.message);
  }
}
