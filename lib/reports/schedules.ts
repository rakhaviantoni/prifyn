export type ReportCadence = "weekly" | "monthly";

function parseTime(value: string) {
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return { hour: 9, minute: 0 };
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function nextReportSendAt(input: {
  cadence: ReportCadence;
  dayOfWeek?: number;
  dayOfMonth?: number;
  sendTime?: string;
  from?: Date;
}) {
  const from = input.from ?? new Date();
  const { hour, minute } = parseTime(input.sendTime ?? "09:00");
  const next = new Date(from);
  next.setSeconds(0, 0);

  if (input.cadence === "monthly") {
    const targetDay = Math.max(1, Math.min(28, input.dayOfMonth ?? 1));
    next.setDate(targetDay);
    next.setHours(hour, minute, 0, 0);
    if (next <= from) next.setMonth(next.getMonth() + 1);
    return next;
  }

  const targetDay = Math.max(0, Math.min(6, input.dayOfWeek ?? 1));
  const currentDay = next.getDay();
  const daysUntil = (targetDay - currentDay + 7) % 7;
  next.setDate(next.getDate() + daysUntil);
  next.setHours(hour, minute, 0, 0);
  if (next <= from) next.setDate(next.getDate() + 7);
  return next;
}

export function splitRecipients(value: string) {
  return value.split(/[,;\n]/).map(item => item.trim()).filter(Boolean);
}
