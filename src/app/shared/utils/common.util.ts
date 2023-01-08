import { Params } from '@angular/router';
import { environment } from '../../../environments/environment';

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
  return `${environment.backendServerBaseUrl}/${path}`;
}
