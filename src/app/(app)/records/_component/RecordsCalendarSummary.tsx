"use client";

import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import { createCalendarDays } from "@/app/(app)/records/_util/recordsCalendar";
import styles from "./recordsCalendarSummary.module.scss";

type TRecordsCalendarSummaryProps = {
  year: number;
  monthIndex: number;
  logs: TBathroomLogRow[];
  isLoading: boolean;
  errorMessage: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function RecordsCalendarSummary({
  year,
  monthIndex,
  logs,
  isLoading,
  errorMessage,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: TRecordsCalendarSummaryProps) {
  const month = monthIndex + 1;
  const calendarDays = createCalendarDays(year, monthIndex, logs);
  const calendarWeeks = Array.from({ length: 6 }, (_, weekIndex) =>
    calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7),
  );

  return (
    <section
      className={styles["calendar-summary"]}
      aria-label="월별 기록 요약"
    >
      <header className={styles["calendar-header"]}>
        <button
          className={styles["month-button"]}
          type="button"
          aria-label="이전 달 보기"
          onClick={onPreviousMonth}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <h2>{year}년 {month}월</h2>
        <button
          className={styles["month-button"]}
          type="button"
          aria-label="다음 달 보기"
          onClick={onNextMonth}
        >
          <span aria-hidden="true">›</span>
        </button>
      </header>

      <div className={styles["calendar-area"]}>
        {isLoading ? (
          <p className={styles["state-message"]} role="status">
            기록을 불러오는 중입니다.
          </p>
        ) : errorMessage ? (
          <p className={styles["state-message"]} role="alert">
            {errorMessage}
          </p>
        ) : (
          <table className={styles["calendar-table"]}>
            <caption className={styles["visually-hidden"]}>
              {year}년 {month}월 기록 달력
            </caption>
            <thead>
              <tr>
                {WEEKDAYS.map((weekday) => (
                  <th key={weekday} scope="col">
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((week) => (
                <tr key={week[0].dateKey}>
                  {week.map((day) => (
                    <td
                      className={
                        day.isCurrentMonth ? undefined : styles["adjacent-day"]
                      }
                      key={day.dateKey}
                    >
                      {!day.isCurrentMonth ? null : !day.hasRecords ? (
                        <span
                          className={`${styles["day-cell"]} ${
                            day.isToday ? styles["today"] : ""
                          }`}
                        >
                          <span className={styles["day-number"]}>
                            {day.dayOfMonth}
                          </span>
                          {day.isToday ? (
                            <span className={styles["today-label"]}>오늘</span>
                          ) : null}
                        </span>
                      ) : (
                        <button
                          className={`${styles["day-cell"]} ${styles["recorded-day"]} ${
                            day.isToday ? styles["today"] : ""
                          }`}
                          type="button"
                          aria-label={`${month}월 ${day.dayOfMonth}일, 소변 ${day.urineCount}회, 대변 ${day.bowelCount}회`}
                          onClick={() => onSelectDate(day.dateKey)}
                        >
                          <span className={styles["day-number"]}>
                            {day.dayOfMonth}
                          </span>
                          <span className={styles["record-count"]}>
                            소변 {day.urineCount}
                          </span>
                          <span className={styles["record-count"]}>
                            대변 {day.bowelCount}
                          </span>
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
