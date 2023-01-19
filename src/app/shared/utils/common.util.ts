import { v4 } from 'uuid';

/**
 * Create identifier (hex) string that should be unique inside this application scope.
 */
export function createUniqueIdString() {
  const uuid = v4();
  const hash = createHash(uuid);
  return hash.toString(16);
}

/* Helper Functions */

/**
 * Create a hash from a string based on Daniel J. Bernstein's "times 33" algorithm.
 */
function createHash(str: string) {
  let hash = 5381;

  for (let i = str.length - 1; i >= 0; --i) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  return hash >>> 0;
}
