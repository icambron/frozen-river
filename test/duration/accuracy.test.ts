import { Duration } from "../../src";
import { DurationUnit } from "../../src/types/duration";
import { ConversionAccuracy } from "../../src/types/common";

const convert = (amt: number, from: DurationUnit, to: DurationUnit, accuracy: ConversionAccuracy) =>
  Duration.fromObject({ [from]: amt }, { conversionAccuracy: accuracy }).as(to);

test("There are slightly more than 365 days in a year", () => {
  expect(convert(1, "years", "days", "casual")).toBeCloseTo(365, 4);
  expect(convert(1, "years", "days", "longterm")).toBeCloseTo(365.2425, 4);

  expect(convert(365, "days", "years", "casual")).toBeCloseTo(1, 4);
  expect(convert(365.2425, "days", "years", "longterm")).toBeCloseTo(1, 4);
});

test("There are slightly more than 30 days in a month", () => {
  expect(convert(1, "month", "days", "casual")).toBeCloseTo(30, 4);
  expect(convert(1, "month", "days", "longterm")).toBeCloseTo(30.4369, 4);
});

test("There are slightly more than 91 days in a quarter", () => {
  expect(convert(1, "quarter", "days", "casual")).toBeCloseTo(91, 4);
  expect(convert(1, "quarter", "days", "longterm")).toBeCloseTo(91.3106, 4);
});
