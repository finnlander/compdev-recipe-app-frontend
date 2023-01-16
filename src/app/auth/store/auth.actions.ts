import { createAction, props } from '@ngrx/store';

import { ErrorContainer } from '../../shared/models/payloads.model';

/* Types */

export enum AuthActionTypes {
  SIGNUP_REQUEST = '[Auth] Signup request',
  SIGNUP_FAILED = '[Auth] Signup failed',
  LOGIN_REQUEST = '[Auth] Login request',
  LOGIN_SUCCEED = '[Auth] Login succeed',
  LOGIN_FAILED = '[Auth] Login failed',
  LOGOUT = '[Auth] Logout',
  CLEAR_ERROR = '[Auth] Clear error',
  SET_INITIALIZED = '[Auth] Set initialized',
}

interface AuthRequestPayload {
  username: string;
  password: string;
}

interface AuthSuccessPayload {
  token: string;
}

/* Actions */

/**
 * Ngrx action to initiate 'signup + login' process.
 */
const signupRequestAction = createAction(
  AuthActionTypes.SIGNUP_REQUEST,
  props<AuthRequestPayload>()
);

/**
 * Ngrx action to report failure of signup attempt.
 */
const signupErrorAction = createAction(
  AuthActionTypes.SIGNUP_FAILED,
  props<ErrorContainer>()
);

/**
 * Ngrx action to initiate login process.
 */
const loginRequestAction = createAction(
  AuthActionTypes.LOGIN_REQUEST,
  props<AuthRequestPayload>()
);

/**
 * Ngrx action to complete login or 'signup + login' process.
 */
const loginSuccessAction = createAction(
  AuthActionTypes.LOGIN_SUCCEED,
  props<AuthSuccessPayload>()
);

/**
 * Ngrx action to report failure of login attempt.
 */
const loginErrorAction = createAction(
  AuthActionTypes.LOGIN_FAILED,
  props<ErrorContainer>()
);

/**
 * Ngrx action to initiate logout.
 */
const logoutAction = createAction(AuthActionTypes.LOGOUT);

/**
 * Ngrx action to clear any error occurred on login/signup action.
 */
const clearErrorAction = createAction(AuthActionTypes.CLEAR_ERROR);

/**
 * Ngrx action to set the auth state as initialized (restored).
 */
const setInitializedAction = createAction(AuthActionTypes.SET_INITIALIZED);

export const authActions = {
  signupRequest: signupRequestAction,
  signupError: signupErrorAction,
  loginRequest: loginRequestAction,
  loginSuccess: loginSuccessAction,
  loginError: loginErrorAction,
  clearError: clearErrorAction,
  logout: logoutAction,
  setInitialized: setInitializedAction,
};
