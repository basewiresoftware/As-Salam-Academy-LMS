/**
 * Calendar-day helpers. Everything here works in LOCAL time on purpose: a date
 * of birth is a calendar day, not an instant, so the moment UTC gets involved
 * the day shifts for anyone who is not on Greenwich.
 */

/** Shape of the wire format. parseDate still range-checks what this matches. */
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Sunday-first, matching the grid buildMonthGrid lays out. */
export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Date -> 'YYYY-MM-DD', read off the local fields. Deliberately not
 * toISOString(): that converts to UTC first, so an evening in Chicago comes
 * back as tomorrow.
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 'YYYY-MM-DD' -> Date at local midnight, or null if it isn't a real day.
 * Never `new Date(value)`: the spec parses a bare date-only string as UTC, so
 * '2015-06-14' becomes the 13th once getDate() reads it back west of UTC.
 */
export function parseDate(value) {
  if (typeof value !== 'string') return null;

  const match = ISO.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (month < 0 || month > 11 || day < 1) return null;

  const date = new Date(year, month, day);
  // The constructor rolls overflow forward — 2015-02-30 quietly becomes 2 March
  // — so round-trip the fields and reject anything that moved.
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** 'YYYY-MM-DD' -> '14 June 2015' for a field face. Empty string if unparsable. */
export function formatDateLong(value) {
  const date = parseDate(value);
  if (!date) return '';
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Days in a month, where `month` is 0-11. Day 0 of the next month is the last
 * day of this one, so February is right in leap years for free and December
 * rolls into the next year without a special case.
 *
 * Note the year is passed straight to the Date constructor, which maps 0-99
 * onto 1900-1999. Nothing here goes near those years, but don't reuse it there.
 */
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Orders two dates by calendar day, ignoring any time component. */
export function compareDay(a, b) {
  const left = startOfDay(a).getTime();
  const right = startOfDay(b).getTime();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function isSameDay(a, b) {
  return Boolean(a) && Boolean(b) && compareDay(a, b) === 0;
}

export function clampDate(date, min, max) {
  if (min && compareDay(date, min) < 0) return min;
  if (max && compareDay(date, max) > 0) return max;
  return date;
}

/**
 * One calendar page, Sunday-first, padding cells null. Always 42 cells (6 rows)
 * so the sheet keeps a constant height and paging months never resizes the
 * dialog — a 31-day month starting Saturday is the worst case and fills 37.
 */
export function buildMonthGrid(year, month) {
  const lead = new Date(year, month, 1).getDay();
  const length = daysInMonth(year, month);
  const cells = new Array(42).fill(null);

  for (let day = 1; day <= length; day += 1) {
    cells[lead + day - 1] = new Date(year, month, day);
  }
  return cells;
}
