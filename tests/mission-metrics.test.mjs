import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyOutcome,
  outcomeMetrics,
  hasCalendarDay,
} from "../src/lib/mission-metrics.ts";
test("pending and unrecognized outcomes do not inflate the success-rate denominator", () => {
  const records = [
    "Success",
    "Success",
    "Failure",
    "Partial Failure",
    "TBD",
    "In Flight",
  ].map((abbrev) => ({ status: { abbrev } }));
  assert.deepEqual(outcomeMetrics(records), {
    success: 2,
    failure: 1,
    partial: 1,
    other: 2,
    completed: 4,
    rate: 50,
  });
});
test("no classified results has no success percentage", () => {
  assert.equal(outcomeMetrics([]).rate, null);
  assert.equal(outcomeMetrics([{ status: { abbrev: "TBC" } }]).rate, null);
});
test("partial failure remains distinct from both failure and success", () => {
  assert.equal(classifyOutcome("Partial Failure"), "partial");
  assert.equal(classifyOutcome("Unknown"), "other");
});
test("month and quarter estimates are never pinned to a day on the calendar", () => {
  for (const abbrev of ["M", "Q1", "Q2", "Y"])
    assert.equal(hasCalendarDay({ abbrev }), false);
  for (const abbrev of ["MIN", "HR", "DAY"])
    assert.equal(hasCalendarDay({ abbrev }), true);
  assert.equal(hasCalendarDay(), false);
});
