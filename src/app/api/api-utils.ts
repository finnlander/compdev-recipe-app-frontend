/* API communication related utility functions */

import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Log backend error response and throw new error with the 'message' field content.
 * @param apiOperation Api operation description.
 * @param error Error response object.
 */
export function logAndUnwrapErrorMessage(
  apiOperation: string,
  error: HttpErrorResponse
) {
  console.error(`API error occurred on ${apiOperation}: `, error);
  return throwError(error.message);
}

/**
 * Get backend API url for path.
 */
export function getApiUrl(path: string) {
  return `${environment.backendServerBaseUrl}/${path}`;
}
