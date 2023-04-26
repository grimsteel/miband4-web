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

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}