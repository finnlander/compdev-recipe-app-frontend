import { JwtPayload } from 'jwt-decode';

/**
 * Authentication request to the backend,.
 */
export interface AuthRequest {
  username: string;
  password: string;
}

/**
 * Success authentication response from the backend.
 */
export interface AuthResponse {
  token: string;
}

/**
 * Access token included by the backend token.
 */
export type AccessToken = JwtPayload & {
  id: number;
  username: string;
};
