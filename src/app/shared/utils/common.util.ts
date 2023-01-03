import { Params } from '@angular/router';

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
