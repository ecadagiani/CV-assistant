/* eslint-disable import/prefer-default-export */
import { parse } from 'date-fns';

/**
 * Parse a date string in the format "YYYY-WW" to a Date object
 * @param {String} str "YYYY-WW" ex: "2021-01" (week 1 of 2021)
 */
export function parseDateFromWeek(stringDateWeek) {
  const stingWeek = stringDateWeek.slice(5, 7);
  const stringYear = stringDateWeek.slice(0, 4);
  const date = parse(stingWeek, 'II', (new Date()).setFullYear(stringYear));
  return date;
}

export function getDaysUntilEndOfMonth() {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDayOfMonth.getDate() - now.getDate();
  return daysRemaining;
}
