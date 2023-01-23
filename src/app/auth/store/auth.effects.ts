import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { authActions, authSelectors } from '.';
import { AuthApi } from '../../api/services/auth-api.service';
import { RoutePath } from '../../config/routes.config';
import { RootState } from '../../store/app.store';
import {
  getDecodedAccessToken,
  getExpirationTimeLeftAsMilliseconds,
} from '../auth-util';
import { AuthService } from '../services/auth.service';

const STORAGE_KEY_AUTH_TOKEN = 'token';

/**
 * Authentication related effects.
 * Note: Angular effects should never throw errors as they will kill the observables that should be re-used on every
 *       dispatched action.
 */
@Injectable()
export class AuthEffects {
  constructor(
    private readonly actions$: Actions,
    private store: Store<RootState>,
    private authApi: AuthApi,
    private authService: AuthService,
    private router: Router
  ) {}

  requestSignup = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.signupRequest),
      switchMap((authRequest) => {
        return this.authApi.signup(authRequest).pipe(
          map(({ token }) => handleAuthentication(token, true)),
          catchError((error: string) =>
            of(
              authActions.signupError({
                error: `Sign up failed on error: ${error}`,
              })
            )
          )
        );
      })
    )
  );

  requestLogin = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.loginRequest),
      switchMap((authRequest) => {
        return this.authApi.login(authRequest).pipe(
          map(({ token }) => handleAuthentication(token)),
          catchError((error: string) =>
            of(
              authActions.loginError({
                error: `Login failed on error: ${error}`,
              })
            )
          )
        );
      })
    )
  );

  storeSession = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.loginSuccess),
        tap(({ token, tokenExpiresAt }) => {
          localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
          this.authService.setLogoutTimer(tokenExpiresAt);
        })
      ),
    { dispatch: false }
  );

  removeSession = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.logout),
        withLatestFrom(
          this.store.select(authSelectors.isPendingInitialization)
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        filter(([_, isPendingInitialization]) => !isPendingInitialization),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map(([action, _]) => action),
        tap(({ setInitialized, redirectUrl }) => {
          localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
          this.authService.clearLogoutTimer();

          // ignore routing on initialization related action to allow redirection to work properly
          if (!setInitialized) {
            this.router.navigate([RoutePath.Auth], {
              queryParams: { logout: true, returnUrl: redirectUrl },
            });
          }
        })
      ),
    { dispatch: false }
  );

  restoreSession = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.restoreSession),
      map(() => {
        const authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
        if (!authToken) {
          return authActions.logout({ setInitialized: true });
        }

        const accessToken = getDecodedAccessToken(authToken);
        if (!accessToken) {
          console.debug('failed to decode access token from: ', authToken);

          return authActions.logout({ setInitialized: true });
        }

        console.debug('Restoring current session');
        if (accessToken.exp) {
          const expTimeMs = getExpirationTimeLeftAsMilliseconds(
            accessToken.exp
          );
          if (expTimeMs <= 0) {
            console.debug('Access token is expired -> initializing logout');
            return authActions.logout({ setInitialized: true });
          } else {
            console.debug(
              ` Session expires in ${new Date(
                new Date().getTime() + expTimeMs
              )}`
            );
          }
        }

        const payload = createLoginPayload(authToken);
        if (payload) {
          return authActions.loginSuccess(payload);
        }

        console.debug(
          'Failed to create login payload out of authentication token -> logging out'
        );
        return authActions.logout({ setInitialized: true });
      })
    )
  );
}

/* Helper Functions */

function handleAuthentication(token: string, isSignup = false) {
  const payload = createLoginPayload(token);
  if (!payload) {
    const errPayload = { error: 'unexpected access token received' };
    console.error('received unexpected token format');
    if (isSignup) {
      return authActions.signupError(errPayload);
    }
    return authActions.loginError(errPayload);
  }

  return authActions.loginSuccess(payload);
}

function createLoginPayload(token: string) {
  const accessToken = getDecodedAccessToken(token);
  if (!accessToken) {
    return null;
  }

  const expTimeSeconds = Math.max(accessToken.exp || 0, 0);
  return {
    token,
    tokenExpiresAt: accessToken.exp ? new Date(expTimeSeconds * 1000) : null,
  };
}
