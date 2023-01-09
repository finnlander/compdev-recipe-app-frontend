import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { getApiUrl } from '../../shared/utils/common.util';

const STORAGE_KEY_AUTH_TOKEN = 'token';

/* Types */
interface AuthRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

type AccessToken = JwtPayload & {
  id: number;
  username: string;
};

/**
 * Service that handles authentication.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser?: User;
  private authToken?: string;
  private expirationAlarm?: ReturnType<typeof setTimeout>;

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
    return this.http.post<AuthResponse>(url, data).pipe(
      map((res) => this.applyLogin(res)),
      catchError(this.handleSignupError)
    );
  }

  /**
   * Login user.
   */
  login(data: AuthRequest) {
    const url = getApiUrl('auth/login');

    return this.http.post<AuthResponse>(url, data).pipe(
      map((res) => this.applyLogin(res)),

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

    if (this.expirationAlarm) {
      clearTimeout(this.expirationAlarm);
      this.expirationAlarm = undefined;
    }

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
    this.authToken = undefined;
    const authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || undefined;
    if (!authToken) {
      this.initialized.next(true);
      return;
    }

    const decodedToken = getDecodedAccessToken(authToken);
    if (!decodedToken) {
      this.initialized.next(true);
      return;
    }

    console.debug('Restoring current session');
    if (decodedToken.exp) {
      const expTimeMs = getExpirationTimeAsMilliseconds(decodedToken.exp);
      if (expTimeMs <= 0) {
        console.debug('Access token is expired -> initializing logout');
        this.initialized.next(true);
        return this.logout();
      } else {
        console.debug(
          ` Session expires in ${new Date(new Date().getTime() + expTimeMs)}`
        );
      }
    }

    this.authToken = authToken;

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

  private applyLogin(res: AuthResponse): User | undefined {
    const accessToken = getDecodedAccessToken(res.token);
    if (!accessToken) {
      this.logout();
      return undefined;
    }

    this.currentUser = {
      id: accessToken.id,
      username: accessToken.username,
    };

    this.authToken = res.token;
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, this.authToken);

    const exp = accessToken.exp;

    if (this.expirationAlarm) {
      clearTimeout(this.expirationAlarm);
      this.expirationAlarm = undefined;
    }

    if (exp) {
      const expirationTime = getExpirationTimeAsMilliseconds(exp);
      this.expirationAlarm = setTimeout(() => {
        console.info('Session expired -> logging out');
        this.logout();
      }, expirationTime);
    }

    this.onLoginChange();

    return this.currentUser;
  }

  private onLoginChange() {
    this.loginChange.next(this.isLoggedIn());
  }
}

/* Helper Functions */

function getDecodedAccessToken(token?: string): AccessToken | undefined {
  if (!token) {
    return undefined;
  }

  try {
    return jwtDecode<AccessToken>(token);
  } catch (error) {
    console.warn('Failed to decode access token');
    return undefined;
  }
}

function getExpirationTimeAsMilliseconds(exp: number) {
  const expMs = exp * 1000;
  const currentTimeMs = new Date().getTime();

  return expMs - currentTimeMs;
}
