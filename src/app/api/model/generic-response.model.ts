/**
 * Generic API response shared by many backend APIs.
 */
export interface GenericResponse {
  status: 'OK' | 'ERROR';
  error?: string;
}
