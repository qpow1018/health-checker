import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import type {
  TMonthRange,
  TRecordsCalendarDay,
} from "@/app/(app)/records/_type/recordsCalendar";

const SEOUL_OFFSET_HOURS = 9;
const CALENDAR_CELL_COUNT = 42;
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function createMonthKey(year: number, monthIndex: number) {
  const monthDate = new Date(Date.UTC(year, monthIndex, 1));
  const normalizedYear = monthDate.getUTCFullYear();
  const normalizedMonth = String(monthDate.getUTCMonth() + 1).padStart(2, "0");

  return `${normalizedYear}-${normalizedMonth}`;
}

export function createMonthRange(
  year: number,
  monthIndex: number,
): TMonthRange {
  const offsetMilliseconds = SEOUL_OFFSET_HOURS * 60 * 60 * 1000;
  const from = new Date(
    Date.UTC(year, monthIndex, 1) - offsetMilliseconds,
  ).toISOString();
  const to = new Date(
    Date.UTC(year, monthIndex + 1, 1) - offsetMilliseconds,
  ).toISOString();

  return { from, to };
}

export function createCalendarDays(
  year: number,
  monthIndex: number,
  logs: readonly TBathroomLogRow[],
): TRecordsCalendarDay[] {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const calendarStart = new Date(
    Date.UTC(year, monthIndex, 1 - firstDay.getUTCDay()),
  );
  const monthKey = createMonthKey(year, monthIndex);
  const todayKey = formatRecordDateKey(new Date().toISOString());
  const countsByDate = createCountsByDate(logs);

  return Array.from({ length: CALENDAR_CELL_COUNT }, (_, index) => {
    const date = new Date(calendarStart);
    date.setUTCDate(calendarStart.getUTCDate() + index);

    const dateKey = formatUtcDateKey(date);
    const counts = countsByDate.get(dateKey) ?? { urineCount: 0, bowelCount: 0 };

    return {
      dateKey,
      dayOfMonth: date.getUTCDate(),
      isCurrentMonth: dateKey.startsWith(monthKey),
      isToday: dateKey === todayKey,
      urineCount: counts.urineCount,
      bowelCount: counts.bowelCount,
      hasRecords: counts.urineCount > 0 || counts.bowelCount > 0,
    };
  });
}

export function filterLogsByDateKey(
  logs: readonly TBathroomLogRow[],
  dateKey: string,
) {
  return logs.filter((log) => formatRecordDateKey(log.logged_at) === dateKey);
}

export function formatRecordDateKey(loggedAt: string) {
  const parts = DATE_KEY_FORMATTER.formatToParts(new Date(loggedAt));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function createCountsByDate(logs: readonly TBathroomLogRow[]) {
  const counts = new Map<
    string,
    { urineCount: number; bowelCount: number }
  >();

  logs.forEach((log) => {
    const dateKey = formatRecordDateKey(log.logged_at);
    const current = counts.get(dateKey) ?? { urineCount: 0, bowelCount: 0 };

    counts.set(dateKey, {
      urineCount:
        current.urineCount + (log.kind === "urine" || log.kind === "both" ? 1 : 0),
      bowelCount:
        current.bowelCount + (log.kind === "bowel" || log.kind === "both" ? 1 : 0),
    });
  });

  return counts;
}

function formatUtcDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
