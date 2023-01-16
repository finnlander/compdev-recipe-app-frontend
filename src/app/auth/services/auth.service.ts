import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { map, skipWhile, switchMap, take } from 'rxjs/operators';
import { AuthApi } from '../../api/services/auth-api.service';
import { RootState } from '../../store/app.store';
import {
  getDecodedAccessToken,
  getExpirationTimeAsMilliseconds,
} from '../auth-util';
import { authActions, authSelectors } from '../store';

const STORAGE_KEY_AUTH_TOKEN = 'token';

/* Types */

/**
 * Service that handles authentication related functionality extending the ngrx store's auth state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private expirationAlarm?: ReturnType<typeof setTimeout>;

  private pendingInitialization = true;
  private afterInitializationCompleted = new ReplaySubject<boolean>();

  constructor(private store: Store<RootState>, private authApi: AuthApi) {
    store.select(authSelectors.getAuthToken).subscribe((authToken) => {
      this.applyLoginStateChange(authToken);
    });

    this.store
      .select(authSelectors.isPendingInitialization)
      .pipe(
        skipWhile((isInitialized) => !isInitialized),
        take(1)
      )
      .subscribe(() => this.afterInitializationCompleted.next(true));
  }

  /**
   * Gate observable to allow waiting until auth service has been initialized.
   */
  afterInitialized(): Observable<void> {
    return this.afterInitializationCompleted.pipe(map(() => undefined));
  }

  /**
   * Get authentication token safely guaranteeing the authentication state has been resumed since page reload and
   * to not requiring unsubscribing for later changes.
   * @returns
   */
  getAuthTokenOnce() {
    return this.afterInitialized().pipe(
      switchMap(() =>
        this.store.select(authSelectors.getAuthToken).pipe(take(1))
      )
    );
  }

  /**
   * Resume authenticated session from local storage data.
   */
  resume() {
    const authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || undefined;
    if (!authToken) {
      this.onResumeFailed();
      return;
    }

    const decodedToken = getDecodedAccessToken(authToken);
    if (!decodedToken) {
      this.onResumeFailed();
      return;
    }

    console.debug('Restoring current session');
    if (decodedToken.exp) {
      const expTimeMs = getExpirationTimeAsMilliseconds(decodedToken.exp);
      if (expTimeMs <= 0) {
        console.debug('Access token is expired -> initializing logout');
        this.onResumeFailed();
      } else {
        console.debug(
          ` Session expires in ${new Date(new Date().getTime() + expTimeMs)}`
        );
      }
    }

    this.store.dispatch(authActions.loginSuccess({ token: authToken }));
    this.store.dispatch(authActions.setInitialized());
    this.pendingInitialization = false;
  }

  /* Helper Functions */

  private applyLoginStateChange(authToken: string | null) {
    console.debug('login state change - authenticated: ', !!authToken);
    if (!authToken) {
      this.handleLogout();
      return;
    }

    const accessToken = getDecodedAccessToken(authToken);
    if (!accessToken) {
      console.debug('failed to decode access token from: ', authToken);
      this.handleLogout();
      return;
    }

    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, authToken);
    if (this.expirationAlarm) {
      clearTimeout(this.expirationAlarm);
      this.expirationAlarm = undefined;
    }

    const exp = accessToken.exp;
    if (!exp) {
      return;
    }

    const expirationTime = getExpirationTimeAsMilliseconds(exp);
    this.expirationAlarm = setTimeout(() => {
      console.info('Session expired -> logging out');
      this.handleLogout();
    }, expirationTime);
  }

  private onResumeFailed() {
    this.store.dispatch(authActions.logout());
    this.store.dispatch(authActions.setInitialized());
    this.pendingInitialization = false;
  }

  private handleLogout() {
    if (!this.pendingInitialization) {
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    }

    if (this.expirationAlarm) {
      clearTimeout(this.expirationAlarm);
      this.expirationAlarm = undefined;
    }
  }
}
