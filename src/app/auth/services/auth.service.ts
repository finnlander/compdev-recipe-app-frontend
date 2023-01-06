import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { getApiUrl } from '../../shared/utils/common.util';

interface AuthRequest {
  username: string;
  password: string;
}

/**
 * Service that handles authentication.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated: boolean = false;
  private currentUser?: User;
  private authToken?: string;

  loginChange = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  signup(data: AuthRequest) {
    const url = getApiUrl('auth/signup');
    return this.http.post<User>(url, data).pipe(
      tap((user) => this.applyLogin(data, user)),
      catchError(this.handleSignupError)
    );
  }

  login(data: AuthRequest) {
    const url = getApiUrl('auth/login');

    return this.http.post<User>(url, data).pipe(
      tap((user) => this.applyLogin(data, user)),

      catchError(this.handleLoginError)
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getAuthToken(): string | undefined {
    if (!this.isLoggedIn()) {
      return undefined;
    }

    return this.authToken;
  }

  getCurrentUser(): User | undefined {
    if (!this.currentUser) return undefined;
    return { ...this.currentUser } as User;
  }

  logout() {
    this.isAuthenticated = false;
    this.authToken = undefined;
    this.currentUser = undefined;

    this.onLoginChange();
  }

  /* Helper Functions */

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

  private applyLogin(data: AuthRequest, user: User) {
    this.isAuthenticated = true;
    this.currentUser = user;
    this.authToken = generateAuthHeader(data);
    this.onLoginChange();
  }

  private onLoginChange() {
    this.loginChange.next(this.isAuthenticated);
  }
}

/* Helper Functions */

function generateAuthHeader(req: AuthRequest): string {
  const data = `${req.username}:${req.password}`;

  return `Basic ${btoa(data)}`;
}
