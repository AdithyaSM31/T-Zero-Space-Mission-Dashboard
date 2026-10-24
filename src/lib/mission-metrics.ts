export function classifyOutcome(
  abbrev: string
): "success" | "failure" | "partial" | "other" {
  if (abbrev === "Success") return "success";
  if (abbrev === "Failure") return "failure";
  if (abbrev === "Partial Failure") return "partial";
  return "other";
}
export function outcomeMetrics(records: { status: { abbrev: string } }[]) {
  const counts = { success: 0, failure: 0, partial: 0, other: 0 };
  for (const record of records) counts[classifyOutcome(record.status.abbrev)]++;
  const completed = counts.success + counts.failure + counts.partial;
  return {
    ...counts,
    completed,
    rate: completed ? (counts.success / completed) * 100 : null,
  };
}
export function hasCalendarDay(precision?: { abbrev: string }) {
  return ["MIN", "SEC", "HR", "DAY"].includes(precision?.abbrev || "");
}
