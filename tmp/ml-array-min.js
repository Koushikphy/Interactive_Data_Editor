import isArray from 'is-any-array';

/**
 * Computes the minimum of the given values
 * @param {Array<number>} input
 * @return {number}
 */
export default function min(input) {
  if (!isArray(input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  let minValue = input[0];
  for (let i = 1; i < input.length; i++) {
    if (input[i] < minValue) minValue = input[i];
  }
  return minValue;
}
