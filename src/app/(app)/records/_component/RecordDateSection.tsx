import type { THealthRecordRow } from "@/api/healthRecords/type";
import type { TRecordCategoryFilter } from "@/app/(app)/records/_type/recordCategoryFilter";
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
  selectedCategory: TRecordCategoryFilter;
}) {
  const { dateLabel, monthKey, records, selectedCategory } = props;

  return (
    <section className={styles["date-section"]}>
      <h2 className={styles["date-heading"]}>{dateLabel}</h2>

      {records.map((record) => {
        const description = getRecordDescription(record);
        const searchParams = new URLSearchParams({ month: monthKey });

        if (selectedCategory !== "all") {
          searchParams.set("category", selectedCategory);
        }

        return (
          <Link
            className={styles["record-item"]}
            href={`/records/${record.id}?${searchParams.toString()}`}
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
