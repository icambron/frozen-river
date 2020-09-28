import { Duration } from "../../src";

//------
// #isDuration
//-------
test("Duration#isDuration return true for valid duration", () => {
  const dur = Duration.fromObject({ hours: 1 });
  expect(Duration.isDuration(dur)).toBe(true);
});

test("Duration#isDuration return false for primitives", () => {
  expect(Duration.isDuration({})).toBe(false);
  expect(Duration.isDuration({ hours: 60 })).toBe(false);
  expect(Duration.isDuration(1)).toBe(false);
  expect(Duration.isDuration("")).toBe(false);
  expect(Duration.isDuration(null)).toBe(false);
  // @ts-expect-error
  expect(Duration.isDuration()).toBe(false);
});
