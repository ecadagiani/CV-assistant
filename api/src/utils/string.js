export function limitStringByDelimitor(str, limit, delimitor = ' ', onward = true, maxOnwardSize = 20) {
  const splittedString = str.split(delimitor);
  let res = '';
  let iterator = 0;
  while (
    iterator < splittedString.length
    && (
      (onward && res.length < limit)
      || (!onward && `${res}${delimitor}${splittedString[iterator]}`.length < limit)
    )
  ) {
    if (iterator === 0) res += splittedString[iterator];
    else res += `${delimitor}${splittedString[iterator]}`;
    iterator++;
  }

  return res.slice(0, limit + onward * maxOnwardSize);
}

export function genRandomString(length = 10) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function sliceAddEllipsis(str, maxLength) {
  const slicedString = limitStringByDelimitor(str, maxLength);
  return slicedString.length < str.length ? `${slicedString}...` : slicedString;
}
