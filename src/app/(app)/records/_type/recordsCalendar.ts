export type TRecordsView = "summary" | "details";

export type TRecordsCalendarDay = {
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  urineCount: number;
  bowelCount: number;
  hasRecords: boolean;
};

export type TMonthRange = {
  from: string;
  to: string;
};
