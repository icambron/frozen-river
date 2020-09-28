import { Duration } from "../../src";
import Helpers from "../helpers";

//------
// #plus()
//------
test("Duration#plus add straightforward durations", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = first.plus(second);

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(8);
  expect(result.milliseconds).toBe(14);
});

test("Duration#plus noops empty druations", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({}),
    result = first.plus(second);

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(2);
});

test("Duration#plus adds negatives", () => {
  const first = Duration.fromObject({ hours: 4, minutes: -12, seconds: -2 }),
    second = Duration.fromObject({ hours: -5, seconds: 6, milliseconds: 14 }),
    result = first.plus(second);

  expect(result.hours).toBe(-1);
  expect(result.minutes).toBe(-12);
  expect(result.seconds).toBe(4);
  expect(result.milliseconds).toBe(14);
});

test("Duration#plus adds single values", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    result = first.plus({ minutes: 5 });

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(17);
  expect(result.seconds).toBe(2);
});

test("Duration#plus adds number as milliseconds", () => {
  const first = Duration.fromObject({ minutes: 11, seconds: 22 }),
    result = first.plus({ milliseconds: 333 });

  expect(result.minutes).toBe(11);
  expect(result.seconds).toBe(22);
  expect(result.milliseconds).toBe(333);
});

test("Duration#plus results in the superset of units", () => {
  let dur = Duration.fromObject({ hours: 1, minutes: 0 }).plus({ seconds: 3, milliseconds: 0 });
  expect(dur.toObject()).toEqual({ hours: 1, minutes: 0, seconds: 3, milliseconds: 0 });

  dur = Duration.fromObject({ hours: 1, minutes: 0 }).plus({});
  expect(dur.toObject()).toEqual({ hours: 1, minutes: 0 });
});

test("Duration#plus throws with invalid parameter", () => {
  // @ts-expect-error
  expect(() => Duration.fromObject({}).plus("123")).toThrow();
});

//------
// #minus()
//------
test("Duration#minus subtracts durations", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = first.minus(second);

  expect(result.hours).toBe(3);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(-4);
  expect(result.milliseconds).toBe(-14);
});

test("Duration#minus subtracts single values", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    result = first.minus({ minutes: 5 });

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(7);
  expect(result.seconds).toBe(2);
});

//------
// #negate()
//------

test("Duration#negate flips all the signs", () => {
  const dur = Duration.fromObject({ hours: 4, minutes: -12, seconds: 2 }),
    result = dur.negate();
  expect(result.hours).toBe(-4);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(-2);
});

test("Duration#negate doesn't mutate", () => {
  const orig = Duration.fromObject({ hours: 8 });
  orig.negate();
  expect(orig.hours).toBe(8);
});

test("Duration#negate preserves conversionAccuracy", () => {
  const dur = Duration.fromObject(
      {
        hours: 4,
        minutes: -12,
        seconds: 2
      },
      {
        conversionAccuracy: "longterm"
      }
    ),
    result = dur.negate();
  expect(Helpers.conversionAccuracy(result)).toBe("longterm");
});

//------
// #mapUnits
//------

test("Duration#units can multiply durations", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 }),
    result = dur.mapUnits(x => x * 5);

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(10);
  expect(result.seconds).toBe(-15);
  expect(result.milliseconds).toBe(-20);
});

test("Duration#units can take the unit into account", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 }),
    result = dur.mapUnits((x, u) => x * (u === "milliseconds" ? 2 : 5));

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(10);
  expect(result.seconds).toBe(-15);
  expect(result.milliseconds).toBe(-8);
});

test("Duration#mapUnits requires that fn returns a number", () => {
  // const dur = Duration.fromObject({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  // @ts-expect-error
  expect(() => dur.mapUnits(() => "hello?")).toThrow();
});