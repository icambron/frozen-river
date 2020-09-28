import { DateTime } from "../../src";
import {
  ConflictingSpecificationError,
  UnparsableStringError,
  MismatchedWeekdayError,
  UnitOutOfRangeError
} from "../../src/errors";
import Helpers from "../helpers";
import { GregorianDateTime } from "../../src/types/datetime";

//------
// .fromFormat
//-------
test("DateTime.fromFormat() parses basic times", () => {
  const i = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test("DateTime.fromFormat() parses with variable-length input", () => {
  let i = DateTime.fromFormat("1982/05/03 09:07:05.004", "y/M/d H:m:s.S");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);

  i = DateTime.fromFormat("82/5/3 9:7:5.4", "yy/M/d H:m:s.S");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);
});

test("DateTime.fromFormat() parses meridiems", () => {
  let i = DateTime.fromFormat("1982/05/25 9 PM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(21);

  i = DateTime.fromFormat("1982/05/25 9 AM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);

  i = DateTime.fromFormat("1982/05/25 12 AM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(0);

  i = DateTime.fromFormat("1982/05/25 12 PM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(12);
});

test("DateTime.fromFormat() throws if you specify meridiem with 24-hour time", () => {
  expect(() => DateTime.fromFormat("930PM", "Hmma")).toThrow(ConflictingSpecificationError);
});

// #714
test("DateTime.fromFormat() makes dots optional and handles non breakable spaces", () => {
  function parseMeridiem(input: string, isAM: boolean) {
    const d = DateTime.fromFormat(input, "hh:mm a");
    expect(d.hour).toBe(isAM ? 10 : 22);
    expect(d.minute).toBe(45);
    expect(d.second).toBe(0);
  }

  Helpers.withDefaultLocale("es-ES", () => {
    // Meridiem for this locale is "a. m." or "p. m.", with a non breakable space
    parseMeridiem("10:45 a. m.", true);
    parseMeridiem("10:45 a. m", true);
    parseMeridiem("10:45 a m.", true);
    parseMeridiem("10:45 a m", true);

    parseMeridiem("10:45 p. m.", false);
    parseMeridiem("10:45 p. m", false);
    parseMeridiem("10:45 p m.", false);
    parseMeridiem("10:45 p m", false);

    const nbsp = String.fromCharCode(160);

    parseMeridiem(`10:45 a.${nbsp}m.`, true);
    parseMeridiem(`10:45 a.${nbsp}m`, true);
    parseMeridiem(`10:45 a${nbsp}m.`, true);
    parseMeridiem(`10:45 a${nbsp}m`, true);

    parseMeridiem(`10:45 p.${nbsp}m.`, false);
    parseMeridiem(`10:45 p.${nbsp}m`, false);
    parseMeridiem(`10:45 p${nbsp}m.`, false);
    parseMeridiem(`10:45 p${nbsp}m`, false);
  });
});

test("DateTime.fromFormat() parses variable-digit years", () => {
  expect(() => DateTime.fromFormat("", "y")).toThrow(UnparsableStringError);
  expect(DateTime.fromFormat("2", "y").year).toBe(2);
  expect(DateTime.fromFormat("22", "y").year).toBe(22);
  expect(DateTime.fromFormat("222", "y").year).toBe(222);
  expect(DateTime.fromFormat("2222", "y").year).toBe(2222);
  expect(DateTime.fromFormat("22222", "y").year).toBe(22222);
  expect(DateTime.fromFormat("222222", "y").year).toBe(222222);
  expect(() => DateTime.fromFormat("2222222", "y")).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat() with yyyyy optionally parses extended years", () => {
  expect(() => DateTime.fromFormat("222", "yyyyy")).toThrow(UnparsableStringError);
  expect(DateTime.fromFormat("2222", "yyyyy").year).toBe(2222);
  expect(DateTime.fromFormat("22222", "yyyyy").year).toBe(22222);
  expect(DateTime.fromFormat("222222", "yyyyy").year).toBe(222222);
  expect(() => DateTime.fromFormat("2222222", "yyyyy")).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat() with yyyyyy strictly parses extended years", () => {
  expect(() => DateTime.fromFormat("2222", "yyyyyy")).toThrow(UnparsableStringError);
  expect(DateTime.fromFormat("222222", "yyyyyy").year).toBe(222222);
  expect(DateTime.fromFormat("022222", "yyyyyy").year).toBe(22222);
  expect(() => DateTime.fromFormat("2222222", "yyyyyy")).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat() defaults yy to the right century", () => {
  expect(DateTime.fromFormat("55", "yy").year).toBe(2055);
  expect(DateTime.fromFormat("70", "yy").year).toBe(1970);
  expect(DateTime.fromFormat("1970", "yy").year).toBe(1970);
});

test("DateTime.fromFormat() parses hours", () => {
  expect(DateTime.fromFormat("5", "h").hour).toBe(5);
  expect(DateTime.fromFormat("12", "h").hour).toBe(12);
  expect(DateTime.fromFormat("05", "hh").hour).toBe(5);
  expect(DateTime.fromFormat("12", "hh").hour).toBe(12);
  expect(DateTime.fromFormat("5", "H").hour).toBe(5);
  expect(DateTime.fromFormat("13", "H").hour).toBe(13);
  expect(DateTime.fromFormat("05", "HH").hour).toBe(5);
  expect(DateTime.fromFormat("13", "HH").hour).toBe(13);
});

test("DateTime.fromFormat() parses milliseconds", () => {
  expect(DateTime.fromFormat("1", "S").millisecond).toBe(1);
  expect(DateTime.fromFormat("12", "S").millisecond).toBe(12);
  expect(DateTime.fromFormat("123", "S").millisecond).toBe(123);
  expect(() => DateTime.fromFormat("1234", "S")).toThrow(UnparsableStringError);

  expect(DateTime.fromFormat("1", "S").millisecond).toBe(1);
  expect(DateTime.fromFormat("12", "S").millisecond).toBe(12);
  expect(DateTime.fromFormat("123", "S").millisecond).toBe(123);

  expect(() => DateTime.fromFormat("1", "SSS")).toThrow(UnparsableStringError);
  expect(() => DateTime.fromFormat("12", "SSS")).toThrow(UnparsableStringError);
  expect(DateTime.fromFormat("123", "SSS").millisecond).toBe(123);
  expect(DateTime.fromFormat("023", "SSS").millisecond).toBe(23);
  expect(() => DateTime.fromFormat("1234", "SSS")).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat() parses fractional seconds", () => {
  expect(DateTime.fromFormat("1", "u").millisecond).toBe(100);
  expect(DateTime.fromFormat("12", "u").millisecond).toBe(120);
  expect(DateTime.fromFormat("123", "u").millisecond).toBe(123);
  expect(DateTime.fromFormat("023", "u").millisecond).toBe(23);
  expect(DateTime.fromFormat("003", "u").millisecond).toBe(3);
  expect(DateTime.fromFormat("1234", "u").millisecond).toBe(123);
  expect(DateTime.fromFormat("1235", "u").millisecond).toBe(123);
});

test("DateTime.fromFormat() parses weekdays", () => {
  expect(DateTime.fromFormat("5", "E").weekday).toBe(5);
  expect(DateTime.fromFormat("5", "c").weekday).toBe(5);

  expect(DateTime.fromFormat("Fri", "EEE").weekday).toBe(5);
  expect(DateTime.fromFormat("Fri", "ccc").weekday).toBe(5);

  expect(DateTime.fromFormat("Friday", "EEEE").weekday).toBe(5);
  expect(DateTime.fromFormat("Friday", "cccc").weekday).toBe(5);
});

test("DateTime.fromFormat() parses eras", () => {
  let dt = DateTime.fromFormat("0206 AD", "yyyy G");
  expect(dt.year).toEqual(206);

  dt = DateTime.fromFormat("0206 BC", "yyyy G");
  expect(dt.year).toEqual(-206);

  dt = DateTime.fromFormat("0206 Before Christ", "yyyy GG");
  expect(dt.year).toEqual(-206);
});

test("DateTime.fromFormat() parses standalone month names", () => {
  let i = DateTime.fromFormat("May 25 1982", "LLLL dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("Sep 25 1982", "LLL dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("5 25 1982", "L dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("05 25 1982", "LL dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("mai 25 1982", "LLLL dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() parses format month names", () => {
  let i = DateTime.fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("5 25 1982", "M dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("05 25 1982", "MM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() parses quarters", () => {
  const i = DateTime.fromFormat("1982Q2", "yyyy[Q]q");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(4);
  expect(i.quarter).toBe(2);
  expect(DateTime.fromFormat("2019Q1", "yyyy[Q]q").month).toBe(1);
  expect(DateTime.fromFormat("2019Q2", "yyyy[Q]q").month).toBe(4);
  expect(DateTime.fromFormat("2019Q3", "yyyy[Q]q").month).toBe(7);
  expect(DateTime.fromFormat("2019Q4", "yyyy[Q]q").month).toBe(10);
  expect(DateTime.fromFormat("2019Q01", "yyyy[Q]qq").month).toBe(1);
  expect(DateTime.fromFormat("2019Q02", "yyyy[Q]qq").month).toBe(4);
  expect(DateTime.fromFormat("2019Q03", "yyyy[Q]qq").month).toBe(7);
  expect(DateTime.fromFormat("2019Q04", "yyyy[Q]qq").month).toBe(10);
});

test("DateTime.fromFormat() makes trailing periods in month names optional", () => {
  const i = DateTime.fromFormat("janv 25 1982", "LLL dd yyyy", {
    locale: "fr"
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() does not match arbitrary stuff with those periods", () => {
  expect(() =>
    DateTime.fromFormat("janvQ 25 1982", "LLL dd yyyy", {
      locale: "fr"
    })
  ).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat() uses case-insensitive matching", () => {
  const i = DateTime.fromFormat("Janv. 25 1982", "LLL dd yyyy", {
    locale: "fr"
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() validates weekday numbers", () => {
  const d = DateTime.fromFormat("2, 05/25/1982", "E, LL/dd/yyyy");
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  expect(() => DateTime.fromFormat("1, 05/25/1982", "E, LL/dd/yyyy")).toThrow(
    MismatchedWeekdayError
  );
});

test("DateTime.fromFormat() validates weekday names", () => {
  let d = DateTime.fromFormat("Tuesday, 05/25/1982", "EEEE, LL/dd/yyyy");
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  expect(() => DateTime.fromFormat("Monday, 05/25/1982", "EEEE, LL/dd/yyyy")).toThrow(
    MismatchedWeekdayError
  );

  d = DateTime.fromFormat("mardi, 05/25/1982", "EEEE, LL/dd/yyyy", {
    locale: "fr"
  });
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
});

test("DateTime.fromFormat() defaults weekday to this week", () => {
  const d = DateTime.fromFormat("Monday", "EEEE"),
    now = DateTime.now();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);

  const d2 = DateTime.fromFormat("3", "E");
  expect(d2.weekYear).toBe(now.weekYear);
  expect(d2.weekNumber).toBe(now.weekNumber);
  expect(d2.weekday).toBe(3);
});

test("DateTime.fromFormat() parses ordinals", () => {
  let d = DateTime.fromFormat("2016 200", "yyyy ooo");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat("2016 200", "yyyy ooo");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat("2016 016", "yyyy ooo");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);

  d = DateTime.fromFormat("2016 200", "yyyy o");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat("2016 16", "yyyy o");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);
});

test("DateTime.fromFormat() throws on mixed units", () => {
  expect(() => {
    DateTime.fromFormat("2017 34", "yyyy WW");
  }).toThrow(ConflictingSpecificationError);

  expect(() => {
    DateTime.fromFormat("2017 05 340", "yyyy MM ooo");
  }).toThrow(ConflictingSpecificationError);
});

test("DateTime.fromFormat() accepts weekYear by itself", () => {
  let d = DateTime.fromFormat("2004", "kkkk");
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);

  d = DateTime.fromFormat("04", "kk");
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);
});

test("DateTime.fromFormat() accepts weekNumber by itself", () => {
  const now = DateTime.now();

  let d = DateTime.fromFormat("17", "WW");
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);

  d = DateTime.fromFormat("17", "W");
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);
});

test("DateTime.fromFormat() accepts weekYear/weekNumber/weekday", () => {
  const d = DateTime.fromFormat("2004 17 2", "kkkk WW E");
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(2);
});

test("DateTime.fromFormat() allows regex content", () => {
  const d = DateTime.fromFormat("Monday", "EEEE"),
    now = DateTime.now();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);
});

test("DateTime.fromFormat() allows literals", () => {
  const i = DateTime.fromFormat("1982/05/25 hello 09:10:11.445", "yyyy/MM/dd [hello] HH:mm:ss.SSS");

  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test("DateTime.fromFormat() rejects gibberish", () => {
  expect(() => DateTime.fromFormat("Splurk", "EEEE")).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat() rejects invalid quarter value", () => {
  expect(() => DateTime.fromFormat("2019Qaa", "yyyy[Q]qq")).toThrow(UnparsableStringError);
  expect(() => DateTime.fromFormat("2019Q00", "yyyy[Q]qq")).toThrow(UnitOutOfRangeError);
  expect(() => DateTime.fromFormat("2019Q0", "yyyy[Q]q")).toThrow(UnitOutOfRangeError);
  expect(() => DateTime.fromFormat("2019Q5", "yyyy[Q]q")).toThrow(UnitOutOfRangeError);
});

test("DateTime.fromFormat() rejects out-of-range values", () => {
  // todo - these are actually several different kinds of errors. clean this up
  const rejects = (s: string, fmt: string, options = {}) =>
    expect(() => DateTime.fromFormat(s, fmt, options)).toThrow();

  rejects("8, 05/25/1982", "E, MM/dd/yyyy", { locale: "fr" });
  rejects("Tuesday, 05/25/1982", "EEEE, MM/dd/yyyy", { locale: "fr" });
  rejects("Giberish, 05/25/1982", "EEEE, MM/dd/yyyy");
  rejects("14/25/1982", "MM/dd/yyyy");
  rejects("05/46/1982", "MM/dd/yyyy");
});

test("DateTime.fromFormat() accepts a zone argument", () => {
  const d = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", {
    zone: "Asia/Tokyo"
  });
  expect(d.zoneName).toBe("Asia/Tokyo");
  expect(d.offset).toBe(9 * 60);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
  expect(d.second).toBe(11);
  expect(d.millisecond).toBe(445);
});

test("DateTime.fromFormat() parses IANA zones", () => {
  let d = DateTime.fromFormat(
    "1982/05/25 09:10:11.445 Asia/Tokyo",
    "yyyy/MM/dd HH:mm:ss.SSS z"
  ).toUTC();
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(0);
  expect(d.minute).toBe(10);

  d = DateTime.fromFormat("1982/05/25 09:10:11.445 UTC", "yyyy/MM/dd HH:mm:ss.SSS z").toUTC();
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test("DateTime.fromFormat() with setZone parses IANA zones and sets it", () => {
  const d = DateTime.fromFormat("1982/05/25 09:10:11.445 Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS z", {
    setZone: true
  });
  expect(d.zoneName).toBe("Asia/Tokyo");
  expect(d.offset).toBe(9 * 60);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test("DateTime.fromFormat() with setZone falls back to provided zone if no zone is found", () => {
  const d = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", {
    setZone: true,
    zone: "Europe/Rome"
  });
  expect(d.zoneName).toBe("Europe/Rome");
  expect(d.offset).toBe(2 * 60);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test("DateTime.fromFormat() with setZone falls back to default zone if no zone is found", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    const d = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", {
      setZone: true
    });
    expect(d.zoneName).toBe("Asia/Tokyo");
    expect(d.offset).toBe(9 * 60);
    expect(d.hour).toBe(9);
    expect(d.minute).toBe(10);
  });
});

test("DateTime.fromFormat() parses fixed offsets", () => {
  const formats = [
    ["Z", "-4"],
    ["ZZ", "-4:00"],
    ["ZZZ", "-0400"]
  ];

  formats.forEach(([format, offset]) => {
    const dt = DateTime.fromFormat(
      `1982/05/25 09:10:11.445 ${offset}`,
      `yyyy/MM/dd HH:mm:ss.SSS ${format}`
    );
    expect(dt.toUTC().hour).toBe(13);
    expect(dt.toUTC().minute).toBe(10);
  });
});

test("DateTime.fromFormat() with setZone parses fixed offsets and sets it", () => {
  const formats = [
    ["Z", "-4"],
    ["ZZ", "-4:00"],
    ["ZZZ", "-0400"]
  ];

  formats.forEach(([format, offset]) => {
    const dt = DateTime.fromFormat(
      `1982/05/25 09:10:11.445 ${offset}`,
      `yyyy/MM/dd HH:mm:ss.SSS ${format}`,
      { setZone: true }
    );
    expect(dt.offset).toBe(-4 * 60);
    expect(dt.toUTC().hour).toBe(13);
    expect(dt.toUTC().minute).toBe(10);
  });
});

test("DateTime.fromFormat() does not support macro tokens with time zone", () => {
  // Parsing time zone names like `EDT` or `Eastern Daylight Time` is not supported
  const formats = ["ttt", "tttt", "TTT", "TTTT", "FFF", "FFFF"];

  const sampleDateTime = DateTime.fromMillis(1555555555555);

  for (const locale of [undefined, "en-gb", "de"]) {
    for (const format of formats) {
      const formatted = sampleDateTime.toFormat(format, { locale });
      expect(() => DateTime.fromFormat(formatted, format, { locale })).toThrow(
        UnparsableStringError
      );
    }
  }
});

test("DateTime.fromFormat() parses localized macro tokens", () => {
  const formatGroups = [
    {
      formats: ["D", "DD", "DDD", "DDDD"],
      expectEqual: {
        year: true,
        month: true,
        day: true
      }
    },

    {
      formats: ["t", "T"],
      expectEqual: {
        hour: true,
        minute: true
      }
    },
    {
      formats: ["tt", "TT"],
      expectEqual: {
        hour: true,
        minute: true,
        second: true
      }
    },
    {
      formats: ["F", "FF"],
      expectEqual: {
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true,
        second: true
      }
    }
  ];

  const sampleDateTime = DateTime.fromMillis(1555555555555);

  for (const { formats, expectEqual } of formatGroups) {
    for (const locale of [undefined, "en-gb", "de"]) {
      for (const format of formats) {
        const formatted = sampleDateTime.toFormat(format, { locale });
        const parsed = DateTime.fromFormat(formatted, format, { locale });

        for (const key of Object.keys(expectEqual)) {
          const unit = key as keyof GregorianDateTime;
          expect(parsed[unit]).toBe(sampleDateTime[unit]);
        }
      }
    }
  }
});

test("DateTime.fromFormat() throws if you don't provide a format", () => {
  // @ts-expect-error
  expect(() => DateTime.fromFormat("yo")).toThrowError();
});

test("DateTime.fromFormat validates weekdays", () => {
  expect(DateTime.fromFormat("Wed 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm")).toBeTruthy();
  expect(() => DateTime.fromFormat("Thu 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm")).toThrow(
    MismatchedWeekdayError
  );
  expect(
    DateTime.fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ")
  ).toBeTruthy();

  expect(
    DateTime.fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", {
      setZone: true
    })
  ).toBeTruthy();

  expect(() =>
    DateTime.fromFormat("Tue 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", {
      setZone: true
    })
  ).toThrow(MismatchedWeekdayError);
});

test("DateTime.fromFormat containg special regex token", () => {
  const ianaFormat = "yyyy-MM-dd[T]HH-mm'z'";
  const dt = DateTime.fromFormat("2019-01-14T11-30'Indian/Maldives'", ianaFormat, {
    setZone: true
  });
  expect(dt.zoneName).toBe("Indian/Maldives");

  expect(
    DateTime.fromFormat("2019-01-14T11-30(Indian/Maldives)", "yyyy-MM-dd[T]HH-mm(z)")
  ).toBeTruthy();

  expect(
    DateTime.fromFormat("2019-01-14T11-30tIndian/Maldivest", "yyyy-MM-dd[T]HH-mm[t]z[t]")
  ).toBeTruthy();

  expect(() =>
    DateTime.fromFormat("2019-01-14T11-30\tIndian/Maldives\t", "yyyy-MM-dd[T]HH-mm[t]z[t]")
  ).toThrow(UnparsableStringError);
});

test("DateTime.fromFormat accepts a nullOnInvalid option", () => {
  expect(DateTime.fromFormat("gorp", "spurp", { nullOnInvalid: true })).toBeNull();
});

//------
// .fromFormatExplain
//-------

function checkObjectKeyCount(o: unknown, count: number) {
  expect(o).toBeInstanceOf(Object);
  expect(Object.keys(o as Object).length).toBe(count);
}

test("DateTime.fromFormatExplain() explains success", () => {
  const ex = DateTime.fromFormatExplain("May 25, 1982 09:10:12.445", "MMMM dd, yyyy HH:mm:ss.SSS");
  expect(ex.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex.matches, 7);
  checkObjectKeyCount(ex.result, 7);
});

test("DateTime.fromFormatExplain() explains a bad match", () => {
  const ex = DateTime.fromFormatExplain("May 25, 1982 09:10:12.445", "MMMM dd, yyyy mmmm");
  expect(ex.rawMatches).toBeNull();
  checkObjectKeyCount(ex.matches, 0);
  checkObjectKeyCount(ex.result, 0);
});

test("DateTime.fromFormatExplain() parses zone correctly", () => {
  const ex = DateTime.fromFormatExplain(
    "America/New_York 1-April-2019 04:10:48 PM Mon",
    "z d-MMMM-yyyy hh:mm:ss a EEE"
  );
  expect(ex.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex.matches, 9);
  checkObjectKeyCount(ex.result, 7);
  expect(ex.matches).toEqual({
    E: 1,
    M: 4,
    a: 1,
    d: 1,
    h: 16,
    m: 10,
    s: 48,
    y: 2019,
    z: "America/New_York"
  });
});

test("DateTime.fromFormatExplain() parses localized string with numberingSystem correctly", () => {
  const ex1 = DateTime.fromFormatExplain(
    "೦೩-ಏಪ್ರಿಲ್-೨೦೧೯ ೧೨:೨೬:೦೭ ಅಪರಾಹ್ನ Asia/Calcutta",
    "dd-MMMM-yyyy hh:mm:ss a z",
    { locale: "kn", numberingSystem: "knda" }
  );
  expect(ex1.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex1.matches, 8);
  checkObjectKeyCount(ex1.result, 6);
  expect(ex1.matches).toEqual({
    M: 4,
    a: 1,
    d: 3,
    h: 12,
    m: 26,
    s: 7,
    y: 2019,
    z: "Asia/Calcutta"
  });

  const ex2 = DateTime.fromFormatExplain(
    "〇三-四-二〇一九 一二:三四:四九 下午 Asia/Shanghai",
    "dd-MMMM-yyyy hh:mm:ss a z",
    { locale: "zh", numberingSystem: "hanidec" }
  );
  expect(ex2.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex2.matches, 8);
  checkObjectKeyCount(ex2.result, 6);
  expect(ex2.matches).toEqual({
    M: 4,
    a: 1,
    d: 3,
    h: 12,
    m: 34,
    s: 49,
    y: 2019,
    z: "Asia/Shanghai"
  });

  const ex3 = DateTime.fromFormatExplain("٠٣-أبريل-٢٠١٩ ٠٣:٤٦:٠١ م", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ar",
    numberingSystem: "arab"
  });
  expect(ex3.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex3.matches, 7);
  checkObjectKeyCount(ex3.result, 6);
  expect(ex3.matches).toEqual({
    M: 4,
    a: 1,
    d: 3,
    h: 15,
    m: 46,
    s: 1,
    y: 2019
  });

  const ex4 = DateTime.fromFormatExplain("۰۳-أبريل-۲۰۱۹ ۰۳:۴۷:۲۱ م", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ar",
    numberingSystem: "arabext"
  });
  expect(ex4.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex4.matches, 7);
  checkObjectKeyCount(ex4.result, 6);

  const ex5 = DateTime.fromFormatExplain("᭐᭓-April-᭒᭐᭑᭙ ᭐᭒:᭔᭔:᭐᭗ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "id",
    numberingSystem: "bali"
  });
  expect(ex5.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex5.matches, 7);
  checkObjectKeyCount(ex5.result, 6);

  const ex6 = DateTime.fromFormatExplain("০৩ এপ্রিল ২০১৯ ১২.৫৭", "dd MMMM yyyy hh.mm", {
    locale: "bn",
    numberingSystem: "beng"
  });
  expect(ex6.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex6.matches, 5);
  checkObjectKeyCount(ex6.result, 5);
  expect(ex6.matches).toEqual({
    M: 4,
    d: 3,
    h: 12,
    m: 57,
    y: 2019
  });

  const ex7 = DateTime.fromFormatExplain(
    "０３-April-２０１９ ０２:４７:０４ PM",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "en-US",
      numberingSystem: "fullwide"
    }
  );
  expect(ex7.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex7.matches, 7);
  checkObjectKeyCount(ex7.result, 6);

  const ex8 = DateTime.fromFormatExplain("०३-April-२०१९ ०२:५३:१९ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "deva"
  });
  expect(ex8.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex8.matches, 7);
  checkObjectKeyCount(ex8.result, 6);

  const ex9 = DateTime.fromFormatExplain("૦૩-એપ્રિલ-૨૦૧૯ ૦૨:૫૫:૨૧ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "gu",
    numberingSystem: "gujr"
  });
  expect(ex9.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex9.matches, 7);
  checkObjectKeyCount(ex9.result, 6);

  const ex10 = DateTime.fromFormatExplain("០៣-April-២០១៩ ០៣:៤៩:២០ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "khmr"
  });
  expect(ex10.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex10.matches, 7);
  checkObjectKeyCount(ex10.result, 6);

  const ex11 = DateTime.fromFormatExplain("໐໓-April-໒໐໑໙ ໐໓:໕໒:໑໑ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "laoo"
  });
  expect(ex11.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex11.matches, 7);
  checkObjectKeyCount(ex11.result, 6);

  const ex12 = DateTime.fromFormatExplain("᥆᥉-April-᥈᥆᥇᥏ ᥆᥉:᥋᥉:᥇᥎ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "limb"
  });
  expect(ex12.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex12.matches, 7);
  checkObjectKeyCount(ex12.result, 6);

  const ex13 = DateTime.fromFormatExplain("൦൩-ഏപ്രിൽ-൨൦൧൯ ൦൩:൫൪:൦൮ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ml",
    numberingSystem: "mlym"
  });
  expect(ex13.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex13.matches, 7);
  checkObjectKeyCount(ex13.result, 6);

  const ex14 = DateTime.fromFormatExplain("᠐᠓-April-᠒᠐᠑᠙ ᠐᠓:᠕᠖:᠑᠙ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "mong"
  });
  expect(ex14.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex14.matches, 7);
  checkObjectKeyCount(ex14.result, 6);

  const ex15 = DateTime.fromFormatExplain("୦୩-April-୨୦୧୯ ୦୩:୫୮:୪୩ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "orya"
  });
  expect(ex15.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex15.matches, 7);
  checkObjectKeyCount(ex15.result, 6);

  const ex16 = DateTime.fromFormatExplain(
    "௦௩-ஏப்ரல்-௨௦௧௯ ௦௪:௦௦:௪௧ பிற்பகல்",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "ta",
      numberingSystem: "tamldec"
    }
  );
  expect(ex16.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex16.matches, 7);
  checkObjectKeyCount(ex16.result, 6);

  const ex17 = DateTime.fromFormatExplain(
    "౦౩-ఏప్రిల్-౨౦౧౯ ౦౪:౦౧:౩౩ PM",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "te",
      numberingSystem: "telu"
    }
  );
  expect(ex17.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex17.matches, 7);
  checkObjectKeyCount(ex17.result, 6);

  const ex18 = DateTime.fromFormatExplain(
    "๐๓-เมษายน-๒๐๑๙ ๐๔:๐๒:๒๔ หลังเที่ยง",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "th",
      numberingSystem: "thai"
    }
  );
  expect(ex18.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex18.matches, 7);
  checkObjectKeyCount(ex18.result, 6);

  const ex19 = DateTime.fromFormatExplain("༠༣-April-༢༠༡༩ ༠༤:༠༣:༢༥ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "tibt"
  });
  expect(ex19.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex19.matches, 7);
  checkObjectKeyCount(ex19.result, 6);

  const ex20 = DateTime.fromFormatExplain("၀၃-April-၂၀၁၉ ၀၄:၁၀:၀၁ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "mymr"
  });
  expect(ex20.rawMatches).toBeInstanceOf(Array);
  checkObjectKeyCount(ex20.matches, 7);
  checkObjectKeyCount(ex20.result, 6);
});

test("DateTime.fromFormatExplain() takes the same options as fromFormat", () => {
  const ex = DateTime.fromFormatExplain("Janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  checkObjectKeyCount(ex.result, 3);
});
