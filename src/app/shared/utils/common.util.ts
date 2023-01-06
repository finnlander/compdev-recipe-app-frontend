import { Params } from '@angular/router';
import { SERVER_BASE_URL } from '../common.contants';

/**
 * Extract numeric 'id' from router path params.
 */
export function getIdFromPathParams(params: Params): number | undefined {
  const id = +params['id'];
  if (!id) {
    return undefined;
  }

  return id;
}

/**
 * Get backend API url for path.
 */
export function getApiUrl(path: string) {
  return `${SERVER_BASE_URL}/${path}`;
}
