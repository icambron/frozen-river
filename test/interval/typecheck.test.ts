import { Interval, DateTime } from "../../src";

//------
// #isInterval
//-------
test("Interval.isInterval return true for valid duration", () => {
  const int = Interval.fromDateTimes(DateTime.now(), DateTime.now());
  expect(Interval.isInterval(int)).toBe(true);
});

test("Interval.isInterval return false for primitives", () => {
  expect(Interval.isInterval({})).toBe(false);
  expect(Interval.isInterval(1)).toBe(false);
  expect(Interval.isInterval("")).toBe(false);
  expect(Interval.isInterval(null)).toBe(false);
  // @ts-expect-error
  expect(Interval.isInterval()).toBe(false);
});
