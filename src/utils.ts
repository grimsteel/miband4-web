import { Weekday, type Alarm } from "./types";

export function getRepetitionDescriptiveText({ days }: Alarm) {
  if (days.has(Weekday.Everyday)) return "Everyday";
  const dayStrings = [];
  if (days.has(Weekday.Sunday)) dayStrings.push("Sun");
  if (days.has(Weekday.Monday)) dayStrings.push("Mon");
  if (days.has(Weekday.Tuesday)) dayStrings.push("Tue");
  if (days.has(Weekday.Wednesday)) dayStrings.push("Wed");
  if (days.has(Weekday.Thursday)) dayStrings.push("Thu");
  if (days.has(Weekday.Friday)) dayStrings.push("Fri");
  if (days.has(Weekday.Saturday)) dayStrings.push("Sat");
  return dayStrings.join(", ");
}