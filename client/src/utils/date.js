export function getNbMonthsBetweenDates(startDate, endDate, timeSkips = []) {
  const nbMonth = (endDate.getMonth() - startDate.getMonth()
    + (12 * (endDate.getFullYear() - startDate.getFullYear())));

  return nbMonth - timeSkips.reduce((acc, timeSkip) => (
    // deepcode ignore MissingArgument: last argument (timeSkips) is optional
    acc + getNbMonthsBetweenDates(timeSkip.start, timeSkip.end) - 1
  ), 0);
}

export function getDateDurationText(t, start, end) {
  if (!start || !end) return undefined;

  let yearContext = '';
  const eventDuration = getNbMonthsBetweenDates(start, end);
  if (Math.floor(eventDuration / 12) > 0) {
    yearContext += `Year${Math.floor(eventDuration / 12) === 1 ? 'One' : 'Plural'}`;
  }
  let monthContext = '';
  if (eventDuration % 12 > 0) {
    monthContext += `Month${eventDuration % 12 === 1 ? 'One' : 'Plural'}`;
  }
  return t('eventDuration', {
    context: yearContext + monthContext,
    years: Math.floor(eventDuration / 12),
    months: eventDuration % 12,
  });
}
