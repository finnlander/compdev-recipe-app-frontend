/* API communication related utility functions */

import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { GenericResponse } from './model/generic-response.model';

/**
 * API response indicating successful outcome.
 */
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

/**
 * API response indicating failure outcome.
 */
export interface ApiFailureResponse {
  ok: false;
  error: string;
}

/**
 * Api Response container to pass both success and failure information easily without re-throwing errors.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export function wrapToSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  const res: ApiSuccessResponse<T> = {
    ok: true,
    data,
  };

  return res;
}

/**
 * Log backend error response and wraps the error in an observable of ApiFailureResponse extracted from the response.
 * @param apiOperation Api operation description.
 * @param error Error response object.
 */
export function logAndWrapErrorMessage(
  apiOperation: string,
  error: HttpErrorResponse
) {
  console.error(`API error occurred on ${apiOperation}: `, error);

  const resBody = error.error;
  if (resBody && typeof resBody === 'object') {
    const apiErrorData = tryGetGenericResponse(resBody);
    if (apiErrorData && apiErrorData.error) {
      const res: ApiFailureResponse = { ok: false, error: apiErrorData.error };
      return of(res);
    }
  }

  const res: ApiFailureResponse = { ok: false, error: error.message };
  return of(res);
}

/**
 * Get backend API url for path.
 */
export function getApiUrl(path: string) {
  return `${environment.backendServerBaseUrl}/${path}`;
}

/* Helper Functions */

function tryGetGenericResponse(resBody: unknown): GenericResponse | undefined {
  if (typeof resBody !== 'object' || resBody === null) {
    return undefined;
  }

  if (!('status' in resBody) || typeof resBody.status !== 'string') {
    return undefined;
  }

  const status = resBody['status'];
  const error =
    'error' in resBody && typeof resBody.error === 'string'
      ? resBody.error
      : undefined;

  const res: GenericResponse = {
    status: 'ERROR' === status ? 'ERROR' : 'OK',
    error,
  };
  return res;
}
