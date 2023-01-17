import {
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';

import { authActions as actions } from '.';

/**
 * Shopping list feature state.
 */
export interface AuthState {
  /**
   * Authentication token (for backend calls).
   */
  authToken: string | null;
  /**
   * Expiration timestamp for authentication token.
   */
  authTokenExpiresAt: Date | null;
  /**
   * Pending on authentication action.
   */
  pendingAuthentication: boolean;
  /**
   * Pending authentication state initialization.
   */
  pendingInitialization: boolean;
  /**
   * Error occurred with latest login or update operation.
   */
  error: string | null;
}

const initialState: Readonly<AuthState> = {
  authToken: null,
  authTokenExpiresAt: null,
  pendingAuthentication: false,
  pendingInitialization: true,
  error: null,
};

/**
 * Authentication state reducer.
 */
export const authReducer = createReducer(
  initialState,
  on(actions.loginRequest, actions.signupRequest, (state, _) => ({
    ...state,
    pendingAuthentication: true,
    error: null,
  })),
  on(actions.loginSuccess, (state, { token, tokenExpiresAt }) => ({
    ...state,
    authToken: token,
    authTokenExpiresAt: tokenExpiresAt,
    pendingAuthentication: false,
    pendingInitialization: false,
    error: null,
  })),
  on(actions.signupError, actions.loginError, (state, { error }) => ({
    ...state,
    pendingAuthentication: false,
    authToken: null,
    authTokenExpiresAt: null,
    error,
  })),
  on(actions.clearError, (state, _) =>
    state.error
      ? {
          ...state,
          error: null,
        }
      : state
  ),
  on(actions.logout, (state, { setInitialized }) => ({
    ...initialState,
    pendingInitialization: setInitialized ? false : state.pendingInitialization,
  }))
);

/* Prepared selectors */

const getAuthStateSelector = createFeatureSelector<AuthState>('auth');

const getAuthErrorSelector = createSelector(
  getAuthStateSelector,
  (state) => state.error
);

const getAuthTokenSelector = createSelector(
  getAuthStateSelector,
  (state) => state.authToken
);

const getAuthTokenExpiresAtSelector = createSelector(
  getAuthStateSelector,
  (state) => state.authTokenExpiresAt
);

const isAuthenticatedSelector = createSelector(
  getAuthStateSelector,
  (state) => !!state.authToken
);

const isPendingAuthenticationSelector = createSelector(
  getAuthStateSelector,
  (state) => state.pendingAuthentication
);

const isPendingInitializationSelector = createSelector(
  getAuthStateSelector,
  (state) => state.pendingInitialization
);

const isPendingStateChangeSelector = createSelector(
  getAuthStateSelector,
  (state) => state.pendingInitialization || state.pendingAuthentication
);

/**
 * Prepared ngrx selectors for authentication state values.
 */
export const authSelectors = {
  getAuthError: getAuthErrorSelector,
  getAuthToken: getAuthTokenSelector,
  getAuthTokenExpiresAt: getAuthTokenExpiresAtSelector,
  isAuthenticated: isAuthenticatedSelector,
  isPendingAuthentication: isPendingAuthenticationSelector,
  isPendingInitialization: isPendingInitializationSelector,
  isPendingStateChange: isPendingStateChangeSelector,
};
