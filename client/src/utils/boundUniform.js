/**
 * Calculates a number within a specified range based on a given number.
 * @param {number} number - The input number.
 * @param {number} lowerBound - The lower bound of the range.
 * @param {number} upperBound - The upper bound of the range.
 * @param {number} numberLowerRange - The lower bound of the input number range.
 * @param {number} numberUpperRange - The upper bound of the input number range.
 * @returns {number} - The calculated number within the range.
 */
export function boundNumberUniform(number, lowerBound, upperBound, numberLowerRange = 0, numberUpperRange = 1) {
  const normalizedNumber = (number - numberLowerRange) / (numberUpperRange - numberLowerRange);
  const num = lowerBound + normalizedNumber * (upperBound - lowerBound);
  return Math.min(Math.max(num, lowerBound), upperBound);
}
