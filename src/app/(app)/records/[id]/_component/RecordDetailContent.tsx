import type { THealthRecordRow } from "@/api/healthRecords/type";
import {
  formatRecordTime,
  getRecordDetailItems,
} from "@/utils/healthRecordsPresentation";

import styles from "./recordDetailContent.module.scss";

export default function RecordDetailContent({ record }: { record: THealthRecordRow }) {
  const recordedAt = new Date(record.recorded_at);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(recordedAt);
  const detailItems = getRecordDetailItems(record);

  return (
    <div className={styles["record-detail-content"]}>
      <section className={styles["record-summary"]} aria-label="기록 일시">
        <time dateTime={record.recorded_at}>{dateLabel}</time>
        <strong>{formatRecordTime(record.recorded_at)}</strong>
      </section>

      <section className={styles["detail-list"]} aria-label="기록 내용">
        {detailItems.map((item) => (
          <div className={styles["detail-item"]} key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </section>
    </div>
  );
}
