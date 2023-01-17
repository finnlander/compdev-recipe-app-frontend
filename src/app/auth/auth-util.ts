/* Authentication related utility functions */

import jwtDecode from 'jwt-decode';
import { environment } from '../../environments/environment';
import { AccessToken } from '../api/model/authentication.model';
import { decodeMockAuthToken } from '../api/services/backend-mock.service';

/**
 * Get decoded access token from the token returned by the backend authentication.
 */
export function getDecodedAccessToken(token?: string): AccessToken | undefined {
  if (!token) {
    return undefined;
  }

  if (environment.enableBackendMock) {
    return decodeMockAuthToken(token);
  }

  try {
    return jwtDecode<AccessToken>(token);
  } catch (error) {
    console.warn('Failed to decode access token');
    return undefined;
  }
}

/**
 * Convert (token) expiration time value into milliseconds value from now.
 */
export function getExpirationTimeLeftAsMilliseconds(exp: number) {
  const expMs = exp * 1000;
  const currentTimeMs = new Date().getTime();

  const diff = expMs - currentTimeMs;
  return Math.max(diff, 0);
}

export function getExpirationTimeFromExpDateLeftAsMilliseconds(exp: Date) {
  const currentTimeMs = new Date().getTime();
  const diff = exp.getTime() - currentTimeMs;

  return Math.max(diff, 0);
}
