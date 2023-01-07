import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { getApiUrl } from '../../shared/utils/common.util';

const STORAGE_KEY_AUTH_TOKEN = 'token';

interface AuthRequest {
  username: string;
  password: string;
}

/**
 * Service that handles authentication.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser?: User;
  private authToken?: string;

  loginChange = new Subject<boolean>();
  private initialized = new ReplaySubject<boolean>(1);

  constructor(private http: HttpClient) {}

  /**
   * Gate observable to allow waiting until auth service has been initialized.
   */
  afterInitialized(): Observable<void> {
    return this.initialized.pipe(
      take(1),
      map((any) => undefined)
    );
  }

  /**
   * Sign up with a new user.
   */
  signup(data: AuthRequest) {
    const url = getApiUrl('auth/signup');
    return this.http.post<User>(url, data).pipe(
      tap((user) => this.applyLogin(data, user)),
      catchError(this.handleSignupError)
    );
  }

  /**
   * Login user.
   */
  login(data: AuthRequest) {
    const url = getApiUrl('auth/login');

    return this.http.post<User>(url, data).pipe(
      tap((user) => this.applyLogin(data, user)),

      catchError(this.handleLoginError)
    );
  }

  /**
   * Logout current user.
   */
  logout() {
    this.currentUser = undefined;
    this.authToken = undefined;
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);

    this.onLoginChange();
  }

  /**
   * Check if user is logged in.
   */
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /**
   * Get Authentication token for backend API.
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Get currently authenticated user.
   */
  getCurrentUser(): Observable<User | undefined> {
    if (this.currentUser) {
      return of<User>({ ...this.currentUser!! } as User);
    }

    if (!this.authToken) {
      // not logged in
      return of<undefined>(undefined);
    }

    const url = getApiUrl('users/me');
    return this.http.get<User>(url).pipe(
      tap((user) => (this.currentUser = { ...user })),
      catchError(this.handleCurrentUserQueryError)
    );
  }

  /**
   * Resume authenticated session from local storage data.
   */
  resume() {
    this.authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || undefined;
    if (!this.authToken) {
      this.initialized.next(true);
      return;
    }

    console.debug('Restoring current session');
    this.getCurrentUser()
      .pipe(
        catchError(() => of(false)),
        map((user) => !!user),
        tap(() => {
          this.initialized.next(true);
          this.onLoginChange();
        })
      )
      .subscribe();
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

  private handleCurrentUserQueryError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError('user not exist');
    }

    console.error('Current user query failed', error);
    return throwError(error.message);
  }

  private applyLogin(data: AuthRequest, user: User) {
    this.currentUser = user;
    this.authToken = generateAuthHeader(data);
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, this.authToken);

    this.onLoginChange();
  }

  private onLoginChange() {
    this.loginChange.next(this.isLoggedIn());
  }
}

/* Helper Functions */

function generateAuthHeader(req: AuthRequest): string {
  const data = `${req.username}:${req.password}`;

  return `Basic ${btoa(data)}`;
}
