// @flow

/**
 * Wraps any error into an Error or returns itself.
 *
 * @param {any} error
 * @return {Error}
 */
export function toError(error: any): Error {
  if (error instanceof Error) {
    return error;
  } else if (error instanceof String) {
    return new Error(error);
  } else {
    return new Error(JSON.stringify(error));
  }
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
