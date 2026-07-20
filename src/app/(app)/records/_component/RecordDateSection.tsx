import type { THealthRecordRow } from "@/api/healthRecords/type";
import Link from "next/link";

import {
  formatRecordTime,
  getRecordCategoryLabel,
  getRecordDescription,
} from "@/utils/healthRecordsPresentation";

import styles from "./recordDateSection.module.scss";

export default function RecordDateSection(props: {
  dateLabel: string;
  monthKey: string;
  records: THealthRecordRow[];
}) {
  const { dateLabel, monthKey, records } = props;

  return (
    <section className={styles["date-section"]}>
      <h2 className={styles["date-heading"]}>{dateLabel}</h2>

      {records.map((record) => {
        const description = getRecordDescription(record);

        return (
          <Link
            className={styles["record-item"]}
            href={`/records/${record.id}?month=${monthKey}`}
            key={record.id}
          >
            <time
              className={styles["record-time"]}
              dateTime={record.recorded_at}
            >
              {formatRecordTime(record.recorded_at)}
            </time>

            <div className={styles["record-content"]}>
              <span className={styles["record-category"]}>
                {getRecordCategoryLabel(record)}
              </span>
              {description && (
                <p className={styles["record-description"]}>{description}</p>
              )}
            </div>
          </Link>
        );
      })}
    </section>
  );
}
