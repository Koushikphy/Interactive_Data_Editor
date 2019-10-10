import isArray from 'is-any-array';

/**
 * Computes the maximum of the given values
 * @param {Array<number>} input
 * @return {number}
 */
export default function max(input) {
  if (!isArray(input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  let maxValue = input[0];
  for (let i = 1; i < input.length; i++) {
    if (input[i] > maxValue) maxValue = input[i];
  }
  return maxValue;
}
