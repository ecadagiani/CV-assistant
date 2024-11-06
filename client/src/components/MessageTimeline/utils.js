import { findIndex, orderBy } from 'lodash';
import { getNbMonthsBetweenDates } from 'src/utils/date';

function createYearMonthDate(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth());
}

function applyMonthOffset(date, monthOffset) {
  return new Date(date.getFullYear(), date.getMonth() + monthOffset);
}

export function parseServerTimelineData(serverTimelineData) {
  return {
    ...serverTimelineData,
    events: serverTimelineData.events.map((event) => ({
      ...event,
      start: createYearMonthDate(event.start),
      end: event.end ? createYearMonthDate(event.end) : undefined,
    })),
  };
}

export function findTimeSkipsForEvent(event, timeSkips) {
  return timeSkips.filter((timeSkip) => (
    (event.start <= timeSkip.start && timeSkip.start < event.end)
    || (event.start < timeSkip.end && timeSkip.end <= event.end)
  ));
}

export function getTimelineMonths(timelineData) {
  let months = [];

  // get first and last date of all events
  // eslint-disable-next-line no-shadow, prefer-const
  let { firstDate, lastDate } = timelineData.events.reduce(({ firstDate, lastDate }, event) => {
    const { start, end } = event;
    return {
      firstDate: start < firstDate ? start : (end && end < firstDate ? end : firstDate),
      lastDate: end && end > lastDate ? end : (start > lastDate ? start : lastDate),
    };
  }, { firstDate: new Date(2500, 0), lastDate: new Date(1700, 0) });

  // Create all months between first and last event in months array
  // last month to first month
  const nbMonths = getNbMonthsBetweenDates(firstDate, lastDate) + 1;
  months = [...new Array(nbMonths)].map((_, index) => ({
    date: applyMonthOffset(lastDate, -index),
    withName: false, // display month name
    isEndOfLine: false, // if month is the last of the line
    isSkip: false, // display dotted line
    events: [],
  }));

  // Add events to months, and set withName to true
  timelineData.events.forEach((event) => {
    const findedTopMonthIndex = findIndex(months, { date: event.end ? event.end : event.start });
    months[findedTopMonthIndex].withName = true;
    months[findedTopMonthIndex].events.push({
      ...event, // {start, end, timelinePosition, title, text, icon, color, skills, ...}
      timeSkips: [], // [{start, end}, ...] - display dotted lines
    });
    if (event.end) {
      const findedBottomMonthIndex = findIndex(months, { date: event.start });
      months[findedBottomMonthIndex].withName = true;
      months[findedBottomMonthIndex].isEndOfLine = true;
    }
  });

  // sort months most recent to oldest
  months = orderBy(months, ['date'], ['desc']);

  // remove and skip empty period
  const {
    skipMinLength = 2,
    skipKeepStartMonth = true,
    skipKeepEndMonth = false,
  } = (timelineData.params || {});

  const monthsToSkip = []; // [{start, end}, ...]
  const skipLength = skipMinLength + (skipKeepEndMonth ? 1 : 0) + (skipKeepStartMonth ? 1 : 0);
  let emptyMonthCount = 0;
  months.forEach((month) => {
    if (month.events.length === 0 && !month.isEndOfLine) {
      emptyMonthCount++;
      return;
    }
    // month have event
    if (emptyMonthCount >= skipLength) {
      monthsToSkip.push({
        start: applyMonthOffset(month.date, (skipKeepStartMonth ? +1 : 0)),
        end: applyMonthOffset(month.date, emptyMonthCount + (skipKeepEndMonth ? 0 : 1)),
      });
    }
    emptyMonthCount = 0;
  });

  // Remove months that are skipped
  monthsToSkip.forEach((skip) => {
    months = months.filter((month) => month.date <= skip.start || month.date >= skip.end);
    const startMonthIndex = findIndex(months, { date: skip.start });
    if (startMonthIndex >= 0) {
      months[startMonthIndex].withName = true;
    }
    const endMonthIndex = findIndex(months, { date: skip.end });
    if (endMonthIndex >= 0) {
      months[endMonthIndex].isSkip = true; // display dotted line to the line above the skipped month
      months[endMonthIndex].withName = true;
    }
  });

  months.forEach(({ events }, monthIndex) => {
    events.forEach((event, eventIndex) => {
      months[monthIndex].events[eventIndex].timeSkips = findTimeSkipsForEvent(event, monthsToSkip);
    });
  });

  return months;
}
