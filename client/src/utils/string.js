export function regexIndexOf(string, regex, startpos) {
  const indexOf = string.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

/**
 * Finds the last index of a regex match in a string
 * @param string The string to search in
 * @param regex The regular expression to search for
 * @param startpos Optional starting position to search from (defaults to end of string)
 * @returns The index of the last match, or -1 if no match found
 */
export function regexLastIndexOf(string, regex, startpos = undefined) {
  const cleanRegex = (regex.global)
    ? regex
    : new RegExp(regex.source, `g${regex.ignoreCase ? 'i' : ''}${regex.multiline ? 'm' : ''}`);

  let cleanStartPos = startpos;
  if (cleanStartPos === undefined) {
    cleanStartPos = string.length;
  } else if (cleanStartPos < 0) {
    cleanStartPos = 0;
  }
  
  const stringToWorkWith = string.substring(0, cleanStartPos + 1);
  let lastIndexOf = -1;
  let nextStop = 0;
  let result;
  // eslint-disable-next-line no-cond-assign
  while ((result = cleanRegex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    cleanRegex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
}

/**
 * Slices a string without breaking words, optionally adding an ellipsis
 * @param str The string to slice
 * @param start The starting index to slice from
 * @param end The ending index to slice to
 * @param ellipsis Optional ellipsis string to append (defaults to '...')
 * @returns The sliced string, trimmed to the last complete word, with optional ellipsis
 */
export function sliceWithoutBreakWord(str, start, end, ellipsis = '...') {
  if (str.length <= end) {
    return str;
  }
  let trimmedString = str.substring(start, end);
  // re-trim if we are in the middle of a word
  trimmedString = trimmedString.substring(0, Math.min(trimmedString.length, regexLastIndexOf(trimmedString, /\s/)));
  return `${trimmedString}${ellipsis}`;
}

export function escapeForId(str) {
  return str.replace(/[^a-zA-Z0-9-_]/g, '_');
}
