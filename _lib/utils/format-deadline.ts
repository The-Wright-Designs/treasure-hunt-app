export function formatDeadlineLabel(isoString: string): string {
  const fmt = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour12: false,
  }).formatToParts(new Date(isoString));

  const get = (type: string) => fmt.find((p) => p.type === type)?.value ?? "";

  return `${get("hour")}:${get("minute")} ${get("weekday")} ${get("day")} ${get("month")} '${get("year").slice(2)}`;
}
