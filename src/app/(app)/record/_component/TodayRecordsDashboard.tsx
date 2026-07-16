import type { THealthRecordRow } from "@/api/healthRecords/type";
import {
  formatRecordTime,
  getRecordCategoryLabel,
  getRecordDescription,
} from "@/utils/healthRecordsPresentation";
import Link from "next/link";
import { MdChevronRight, MdEditNote } from "react-icons/md";

import styles from "./todayRecordsDashboard.module.scss";

export default function TodayRecordsDashboard(props: {
  isError: boolean;
  isLoading: boolean;
  monthKey: string;
  records: THealthRecordRow[];
}) {
  const { isError, isLoading, monthKey, records } = props;
  const recentRecords = records.slice(0, 3);

  return (
    <section
      aria-busy={isLoading}
      aria-label="오늘 기록"
      className={styles["today-records-dashboard"]}
    >
      <header className={styles["dashboard-header"]}>
        <h2>
          오늘 기록
          {!isLoading && !isError && (
            <span className={styles["record-count"]}>{records.length}건</span>
          )}
        </h2>
        {!isLoading && !isError && records.length > 0 && (
          <Link href={`/records?month=${monthKey}`}>
            전체 보기
            <MdChevronRight aria-hidden="true" />
          </Link>
        )}
      </header>

      {isLoading && (
        <p className={styles["dashboard-state"]} role="status">
          오늘 기록을 불러오는 중...
        </p>
      )}

      {isError && (
        <p className={styles["dashboard-state"]} role="alert">
          오늘 기록을 불러오지 못했어요.
        </p>
      )}

      {!isLoading && !isError && records.length === 0 && (
        <p className={styles["dashboard-state"]}>
          <span className={styles["empty-icon"]}>
            <MdEditNote aria-hidden="true" />
          </span>
          <strong>오늘 기록이 아직 없어요.</strong>
          <span>아래에서 바로 기록해 보세요.</span>
        </p>
      )}

      {!isLoading && !isError && recentRecords.length > 0 && (
        <ul className={styles["recent-record-list"]}>
          {recentRecords.map((record) => {
            const description = getRecordDescription(record);

            return (
              <li key={record.id}>
                <Link
                  className={styles["recent-record-link"]}
                  href={`/records/${record.id}?month=${monthKey}`}
                >
                  <time dateTime={record.recorded_at}>
                    {formatRecordTime(record.recorded_at)}
                  </time>
                  <span className={styles["record-content"]}>
                    <strong>{getRecordCategoryLabel(record)}</strong>
                    {description && <span>{description}</span>}
                  </span>
                  <MdChevronRight aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
