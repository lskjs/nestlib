/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
export function isKeyable(value) {
  const type = typeof value;
  return type == 'string' ||
    type == 'number' ||
    type == 'symbol' ||
    type == 'boolean'
    ? value !== '__proto__'
    : value === null;
}

export default isKeyable;