/* global test expect */

import { DateTime } from '../../src/luxon';

//------
// .fromISO
//-------
test('DateTime.fromISO() parses as local by default', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123');
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() uses the offset provided, but keeps the dateTime as local', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123+06:00');
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 3,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() uses the Z if provided, but keeps the dateTime as local', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123Z');
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() optionally adopts the UTC offset provided', () => {
  let dt = DateTime.fromISO('2016-05-25T09:08:34.123+06:00', { setZone: true });
  expect(dt.zone.name).toBe('UTC+6');
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });

  dt = DateTime.fromISO('1983-10-14T13:30Z', { setZone: true });
  expect(dt.zone.name).toBe('UTC');
  expect(dt.offset).toBe(0);
  expect(dt.toObject()).toEqual({
    year: 1983,
    month: 10,
    day: 14,
    hour: 13,
    minute: 30,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() can optionally specify a zone', () => {
  let dt = DateTime.fromISO('2016-05-25T09:08:34.123', { zone: 'utc' });
  expect(dt.offset).toEqual(0);
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });

  dt = DateTime.fromISO('2016-05-25T09:08:34.123+06:00', { zone: 'utc' });
  expect(dt.offset).toEqual(0);
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 3,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

const isSame = (s, expected) => expect(DateTime.fromISO(s).toObject()).toEqual(expected);

test('DateTime.fromISO() accepts just the year', () => {
  isSame('2016', {
    year: 2016,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-month', () => {
  isSame('2016-05', {
    year: 2016,
    month: 5,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-month-day', () => {
  isSame('2016-05-25', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts yearmonthday', () => {
  isSame('20160525', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts extend years', () => {
  isSame('+002016-05-25', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });

  isSame('-002016-05-25', {
    year: -2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-moth-dayThour', () => {
  isSame('2016-05-25T09', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-moth-dayThour:minute', () => {
  isSame('2016-05-25T09:24', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0
  });

  isSame('2016-05-25T0924', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-moth-dayThour:minute:second', () => {
  isSame('2016-05-25T09:24:15', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0
  });

  isSame('2016-05-25T092415', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-moth-dayThour:minute:second.millisecond', () => {
  isSame('2016-05-25T09:24:15.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016-05-25T092415.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016-05-25T09:24:15,123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016-05-25T09:24:15.123456789', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016-05-25T09:24:15.023', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 23
  });

  isSame('2016-05-25T09:24:15.3456', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 346
  });

  isSame('2016-05-25T09:24:15.1', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 100
  });
});

test('DateTime.fromISO() accepts year-week-day', () => {
  isSame('2016-W21-3', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });

  isSame('2016W213', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-week-dayTtime', () => {
  isSame('2016-W21-3T09:24:15.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016W213T09:24:15.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });
});

test('DateTime.fromISO() accepts year-ordinal', () => {
  isSame('2016-200', {
    year: 2016,
    month: 7,
    day: 18,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });

  isSame('2016200', {
    year: 2016,
    month: 7,
    day: 18,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() accepts year-ordinalTtime', () => {
  isSame('2016-200T09:24:15.123', {
    year: 2016,
    month: 7,
    day: 18,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });
});

test('DateTime.fromISO() accepts some technically incorrect stuff', () => {
  // these are formats that aren't technically valid but we parse anyway.
  // Testing them more to document them than anything else
  isSame('2016-05-25T0924:15.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016-05-25T09:2415.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  isSame('2016-W213', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromISO() rejects poop', () => {
  const rejects = s => expect(DateTime.fromISO(s).isValid).toBeFalsy();

  rejects(null);
  rejects('');
  rejects(' ');
  rejects('2016-1');
  rejects('2016-1-15');
  rejects('2016-01-5');
  rejects('2016-05-25 08:34:34');
  rejects('2016-05-25Q08:34:34');
  rejects('2016-05-25T8:04:34');
  rejects('2016-05-25T08:4:34');
  rejects('2016-05-25T08:04:4');
  rejects('2016-05-25T:03:4');
  rejects('2016-05-25T08::4');
  rejects('2016-W32-02');

  // some of these are actually valid iso we don't take (yet)
  rejects('2016-W32');
});

//------
// .fromRFC2822
//-------

test('DateTime.fromRFC2822() accepts full format', () => {
  const dt = DateTime.fromRFC2822('Tue, 01 Nov 2016 13:23:12 +0630');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 6,
    minute: 53,
    second: 12,
    millisecond: 0
  });
});

test('DateTime.fromRFC2822 parses a range of dates', () => {
  const testCases = {
    'Sun, 12 Apr 2015 05:06:07 GMT': [2015, 4, 12, 5, 6, 7],
    'Tue, 01 Nov 2016 01:23:45 +0000': [2016, 11, 1, 1, 23, 45],
    'Tue, 01 Nov 16 04:23:45 Z': [2016, 11, 1, 4, 23, 45],
    '01 Nov 2016 05:23:45 z': [2016, 11, 1, 5, 23, 45],
    'Mon, 02 Jan 2017 06:00:00 -0800': [2017, 1, 2, 6 + 8, 0, 0],
    'Mon, 02 Jan 2017 06:00:00 +0800': [2017, 1, 1, 22, 0, 0],
    'Mon, 02 Jan 2017 06:00:00 +0330': [2017, 1, 2, 2, 30, 0],
    'Mon, 02 Jan 2017 06:00:00 -0330': [2017, 1, 2, 9, 30, 0],
    'Mon, 02 Jan 2017 06:00:00 PST': [2017, 1, 2, 6 + 8, 0, 0],
    'Mon, 02 Jan 2017 06:00:00 PDT': [2017, 1, 2, 6 + 7, 0, 0]
  };

  for (const testString in testCases) {
    if (testCases.hasOwnProperty(testString)) {
      const expected = testCases[testString],
        r = DateTime.fromRFC2822(testString).toUTC(),
        actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
      expect(expected).toEqual(actual);
    }
  }
});

test('DateTime.fromRFC2822() rejects incorrect days of the week', () => {
  const dt = DateTime.fromRFC2822('Wed, 01 Nov 2016 13:23:12 +0600');
  expect(dt.isValid).toBe(false);
});

test('DateTime.fromRFC2822() can elide the day of the week', () => {
  const dt = DateTime.fromRFC2822('01 Nov 2016 13:23:12 +0600');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 7,
    minute: 23,
    second: 12,
    millisecond: 0
  });
});

test('DateTime.fromRFC2822() can elide seconds', () => {
  const dt = DateTime.fromRFC2822('01 Nov 2016 13:23 +0600');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 7,
    minute: 23,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromRFC2822() can use Z', () => {
  const dt = DateTime.fromRFC2822('01 Nov 2016 13:23:12 Z');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 13,
    minute: 23,
    second: 12,
    millisecond: 0
  });
});

test('DateTime.fromRFC2822() can use a weird subset of offset abbreviations', () => {
  const dt = DateTime.fromRFC2822('01 Nov 2016 13:23:12 EST');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 18,
    minute: 23,
    second: 12,
    millisecond: 0
  });
});

//------
// .fromHTTP
//-------

test('DateTime.fromHTTP() can parse RFC 1123', () => {
  const dt = DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 1994,
    month: 11,
    day: 6,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0
  });
});

test('DateTime.fromHTTP() can parse RFC 850', () => {
  const dt = DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 1994,
    month: 11,
    day: 6,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0
  });
});

test('DateTime.fromHTTP() can parse ASCII dates with one date digit', () => {
  const dt = DateTime.fromHTTP('Sun Nov  6 08:49:37 1994');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 1994,
    month: 11,
    day: 6,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0
  });
});

test('DateTime.fromHTTP() can parse ASCII dates with two date digits', () => {
  const dt = DateTime.fromHTTP('Wed Nov 16 08:49:37 1994');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 1994,
    month: 11,
    day: 16,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0
  });
});

test('DateTime.fromSQL() can parse SQL Date YYYY-MM-DD', () => {
  const dt = DateTime.fromSQL('2016-05-14');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 14,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromSQL() can parse SQL Time 04:12:00.123', () => {
  const dt = DateTime.fromSQL('04:12:00.123');
  expect(dt.isValid).toBe(true);
  const now = new Date();
  expect(dt.toUTC().toObject()).toEqual({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
    hour: 4,
    minute: 12,
    second: 0,
    millisecond: 0
  });
});

test('DateTime.fromSQL() can parse SQL DateTime 2016-05-14 10:23:54.234', () => {
  const dt = DateTime.fromSQL('2016-05-14 10:23:54.234');
  expect(dt.isValid).toBe(true);
  expect(dt.toUTC().toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 14,
    hour: 10,
    minute: 23,
    second: 54,
    millisecond: 0
  });
});
