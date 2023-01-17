import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, skipWhile, take, withLatestFrom } from 'rxjs/operators';
import { RootState } from '../../store/app.store';
import { getExpirationTimeFromExpDateLeftAsMilliseconds } from '../auth-util';
import { authActions, authSelectors } from '../store';

/**
 * Service that handles authentication related functionality extending the ngrx store's auth state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private expirationAlarm?: ReturnType<typeof setTimeout>;

  constructor(private store: Store<RootState>, private router: Router) {}

  /**
   * Get authentication token safely guaranteeing the authentication state has been resumed since page reload or login
   * action and to not requiring unsubscribing for later changes.
   */
  getAuthTokenOnce() {
    return this.store.select(authSelectors.isPendingStateChange).pipe(
      skipWhile((isPendingStateChange) => isPendingStateChange),
      withLatestFrom(this.store.select(authSelectors.getAuthToken)),
      map(([_, authToken]) => authToken),
      take(1)
    );
  }

  /**
   * Set the timer that will logout the user automatically after the expiration time is elapsed.
   */
  setLogoutTimer(expiresAt: Date | null) {
    this.clearLogoutTimer();
    if (!expiresAt) {
      return;
    }

    const expirationTime =
      getExpirationTimeFromExpDateLeftAsMilliseconds(expiresAt);

    this.expirationAlarm = setTimeout(() => {
      const currentUrl = this.router.url;
      console.info('Session expired -> logging out');
      this.expirationAlarm = undefined;
      this.store.dispatch(authActions.logout({ redirectUrl: currentUrl }));
    }, expirationTime);

    console.debug(
      'New expiration time for the session was set to: ',
      expiresAt
    );
  }

  /**
   * Clear the timer that will logout the user automatically after the expiration time is elapsed.
   */
  clearLogoutTimer() {
    if (!this.expirationAlarm) {
      return;
    }

    clearTimeout(this.expirationAlarm);
    this.expirationAlarm = undefined;
  }
}
