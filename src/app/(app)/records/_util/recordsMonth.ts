export function getRecordMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function isRecordMonthKey(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }

  const { monthIndex } = parseRecordMonth(value);

  return monthIndex >= 0 && monthIndex <= 11;
}

export function getAdjacentRecordMonth(monthKey: string, offset: -1 | 1) {
  const { year, monthIndex } = parseRecordMonth(monthKey);

  return getRecordMonthKey(new Date(year, monthIndex + offset, 1));
}

export function getRecordMonthRange(monthKey: string) {
  const { year, monthIndex } = parseRecordMonth(monthKey);

  return {
    from: new Date(year, monthIndex, 1).toISOString(),
    to: new Date(year, monthIndex + 1, 1).toISOString(),
  };
}

export function formatRecordMonth(monthKey: string) {
  const { year, monthIndex } = parseRecordMonth(monthKey);

  return `${year}년 ${monthIndex + 1}월`;
}

function parseRecordMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return { year, monthIndex: month - 1 };
}
