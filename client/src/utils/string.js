export function regexIndexOf(string, regex, startpos) {
  const indexOf = string.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

export function regexLastIndexOf(string, regex, startpos = undefined) {
  const cleanRegex = (regex.global)
    ? regex
    : new RegExp(regex.source, `g${regex.ignoreCase ? 'i' : ''}${regex.multiLine ? 'm' : ''}`);

  let cleanStartPos = startpos;
  if (typeof (startpos) === 'undefined') {
    cleanStartPos = string.length;
  } else if (startpos < 0) {
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

export function sliceWithoutBreakWord(str, start, end, ellipsis = '...') {
  if (str.length <= end) {
    return str;
  }
  let trimmedString = str.substr(start, end);
  // re-trim if we are in the middle of a word
  trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, regexLastIndexOf(trimmedString, /\s/)));
  return `${trimmedString}${ellipsis}`;
}

export function escapeForId(str) {
  return str.replace(/[^a-zA-Z0-9-_]/g, '_');
}
