import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { authActions } from '.';
import { AuthApi } from '../../api/services/auth-api.service';

/**
 * Authentication related effects.
 * Note: Angular effects should never throw errors as they will kill the observables that should be re-used on every
 *       dispatched action.
 */
@Injectable()
export class AuthEffects {
  constructor(private readonly actions$: Actions, private authApi: AuthApi) {}

  requestSignup = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.signupRequest),
      switchMap((authRequest) => {
        return this.authApi.signup(authRequest).pipe(
          map(({ token }) => {
            return authActions.loginSuccess({
              token,
            });
          }),
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
          map(({ token }) => {
            return authActions.loginSuccess({
              token,
            });
          }),
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
}
