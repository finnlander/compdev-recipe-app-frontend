import { createAction, props } from '@ngrx/store';

import { ErrorContainer } from '../../shared/models/payloads.model';

/* Types */

export enum AuthActionTypes {
  CLEAR_ERROR = '[Auth] Clear error',
  LOGIN_REQUEST = '[Auth] Login request',
  LOGIN_SUCCEED = '[Auth] Login succeed',
  LOGIN_FAILED = '[Auth] Login failed',
  LOGOUT = '[Auth] Logout',
  RESTORE_SESSION = '[Auth] Restore session',
  SET_INITIALIZED = '[Auth] Set initialized',
  SIGNUP_FAILED = '[Auth] Signup failed',
  SIGNUP_REQUEST = '[Auth] Signup request',
}

interface AuthRequestPayload {
  username: string;
  password: string;
}

interface AuthSuccessPayload {
  token: string;
  tokenExpiresAt: Date | null;
}

interface LogoutPayload {
  setInitialized?: boolean;
  redirectUrl?: string;
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
const logoutAction = createAction(
  AuthActionTypes.LOGOUT,
  props<LogoutPayload>()
);

/**
 * Ngrx action to clear any error occurred on login/signup action.
 */
const clearErrorAction = createAction(AuthActionTypes.CLEAR_ERROR);

/**
 * Ngrx action to set the auth state as initialized (restored).
 */
const setInitializedAction = createAction(AuthActionTypes.SET_INITIALIZED);

/**
 * Ngrx action to initiate previous authentication session restoration from local storage based token.
 */
const restoreSessionAction = createAction(AuthActionTypes.RESTORE_SESSION);

/**
 * Authentication related actions.
 */
export const authActions = {
  clearError: clearErrorAction,
  loginError: loginErrorAction,
  loginRequest: loginRequestAction,
  loginSuccess: loginSuccessAction,
  logout: logoutAction,
  restoreSession: restoreSessionAction,
  setInitialized: setInitializedAction,
  signupError: signupErrorAction,
  signupRequest: signupRequestAction,
};
