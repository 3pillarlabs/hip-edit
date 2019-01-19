// @flow

/**
 * Wraps any error into an Error or returns itself.
 *
 * @param {any} error
 * @return {Error}
 */
export function toError(error: any): Error {
  return error instanceof Error ? error : new Error(error);
}

/**
 * Convert an error to an object.
 *
 * @param {Error} error
 * @return {Object}
 */
export function toObject(error: Error): {error: string} {
  return {error: error.message};
}
