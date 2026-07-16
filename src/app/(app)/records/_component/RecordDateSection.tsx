import type { THealthRecordRow } from "@/api/healthRecords/type";
import Link from "next/link";

import {
  formatRecordTime,
  getRecordCategoryLabel,
  getRecordDescription,
} from "@/app/(app)/records/_util/healthRecordsPresentation";

import {
  MdBedtime,
  MdOutlineCalendarToday,
  MdOutlineWc,
  MdRestaurant,
  MdSentimentSatisfiedAlt,
} from "react-icons/md";

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
        const Icon = getRecordIcon(record.category);

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

            <span className={styles["record-icon"]} aria-hidden="true">
              <Icon />
            </span>
          </Link>
        );
      })}
    </section>
  );
}

function getRecordIcon(category: string) {
  if (category === "sleep") {
    return MdBedtime;
  }

  if (category === "toilet") {
    return MdOutlineWc;
  }

  if (category === "food") {
    return MdRestaurant;
  }

  if (category === "condition") {
    return MdSentimentSatisfiedAlt;
  }

  return MdOutlineCalendarToday;
}
