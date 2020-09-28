import {
  integerBetween,
  isLeapYear,
  timeObject,
  daysInYear,
  daysInMonth,
  weeksInWeekYear,
  isInteger
} from "./util";
import { TimeObject, WeekDateTime, GregorianDateTime, OrdinalDateTime } from "../types/datetime";

const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
  leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

function dayOfWeek(year: number, month: number, day: number) {
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 7 : js;
}

function computeOrdinal(year: number, month: number, day: number) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}

function uncomputeOrdinal(year: number, ordinal: number) {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder,
    month0 = table.findIndex(i => i < ordinal),
    day = ordinal - table[month0];
  return { month: month0 + 1, day };
}

/**
 * @private
 */

export function gregorianToWeek(gregObj: GregorianDateTime): WeekDateTime {
  const { year, month, day } = gregObj,
    ordinal = computeOrdinal(year, month, day),
    weekday = dayOfWeek(year, month, day);

  let weekNumber = Math.floor((ordinal - weekday + 10) / 7),
    weekYear;

  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear);
  } else if (weekNumber > weeksInWeekYear(year)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }

  return Object.assign({ weekYear, weekNumber, weekday }, timeObject(gregObj));
}

export function weekToGregorian(weekData: WeekDateTime) {
  const { weekYear, weekNumber, weekday } = weekData,
    weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
    yearInDays = daysInYear(weekYear);

  let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
    year;

  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }

  const { month, day } = uncomputeOrdinal(year, ordinal);

  return Object.assign({ year, month, day }, timeObject(weekData));
}

export function gregorianToOrdinal(gregData: GregorianDateTime): OrdinalDateTime {
  const { year, month, day } = gregData,
    ordinal = computeOrdinal(year, month, day);

  return Object.assign({ year, ordinal }, timeObject(gregData));
}

export function ordinalToGregorian(ordinalData: OrdinalDateTime) {
  const { year, ordinal } = ordinalData,
    { month, day } = uncomputeOrdinal(year, ordinal);

  return Object.assign({ year, month, day }, timeObject(ordinalData));
}

export type UnitError = [string, number] | null;

export function hasInvalidWeekData(obj: WeekDateTime): UnitError {
  const validYear = isInteger(obj.weekYear),
    validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear)),
    validWeekday = integerBetween(obj.weekday, 1, 7);

  if (!validYear) {
    return ["weekYear", obj.weekYear];
  } else if (!validWeek) {
    return ["weekNumber", obj.weekNumber];
  } else if (!validWeekday) {
    return ["weekday", obj.weekday];
  } else return null;
}

export function hasInvalidOrdinalData(obj: OrdinalDateTime): UnitError {
  const validYear = isInteger(obj.year),
    validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));

  if (!validYear) {
    return ["year", obj.year];
  } else if (!validOrdinal) {
    return ["ordinal", obj.ordinal];
  } else return null;
}

export function hasInvalidGregorianData(obj: GregorianDateTime): UnitError {
  const validYear = isInteger(obj.year),
    validMonth = integerBetween(obj.month, 1, 12),
    validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));

  if (!validYear) {
    return ["year", obj.year];
  } else if (!validMonth) {
    return ["month", obj.month];
  } else if (!validDay) {
    return ["day", obj.day];
  } else return null;
}

export function hasInvalidTimeData(obj: TimeObject): UnitError {
  const { hour, minute, second, millisecond } = obj;
  const validHour =
      integerBetween(hour, 0, 23) ||
      (hour === 24 && minute === 0 && second === 0 && millisecond === 0),
    validMinute = integerBetween(minute, 0, 59),
    validSecond = integerBetween(second, 0, 59),
    validMillisecond = integerBetween(millisecond, 0, 999);

  if (!validHour) {
    return ["hour", obj.hour];
  } else if (!validMinute) {
    return ["minute", obj.minute];
  } else if (!validSecond) {
    return ["second", obj.second];
  } else if (!validMillisecond) {
    return ["millisecond", obj.millisecond];
  } else return null;
}
