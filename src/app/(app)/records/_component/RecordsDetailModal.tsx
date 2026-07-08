import BottomModal from "@/components/common/bottomModal/BottomModal";
import { Button } from "@/components/common/button/Button";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import { RECORD_KIND_LABEL } from "@/app/(app)/record/_define/recordOptions";
import {
  formatRecordDateLabel,
  formatRecordTimeLabel,
} from "@/app/(app)/records/_util/recordsPresentation";

import styles from "./recordsDetailModal.module.scss";

type TRecordsDetailModalProps = {
  log: TBathroomLogRow;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function RecordsDetailModal({
  log,
  onClose,
  onEdit,
  onDelete,
}: TRecordsDetailModalProps) {
  return (
    <BottomModal title="기록 상세" isOpen={true} onClose={onClose}>
      <div className={styles["detail-content"]}>
        <div className={styles.summary}>
          <span className={styles.kind}>{RECORD_KIND_LABEL[log.kind]}</span>
          <span className={styles.time}>
            {formatRecordDateLabel(log.logged_at)} {formatRecordTimeLabel(log.logged_at)}
          </span>
        </div>

        <dl className={styles["detail-list"]}>
          <DetailItem label="긴급도" value={formatNullableValue(log.urgency)} />
          <DetailItem
            label="자다가 깼음"
            value={formatBooleanValue(log.woke_from_sleep)}
          />
          <DetailItem label="대변 상태" value={formatNullableValue(log.stool_state)} />
          <DetailItem label="소변 통증" value={formatBooleanValue(log.urine_pain)} />
          <DetailItem label="대변 통증" value={formatBooleanValue(log.bowel_pain)} />
          <DetailItem label="혈변 의심" value={formatBooleanValue(log.possible_blood)} />
          <DetailItem
            label="색이 평소와 다름"
            value={formatBooleanValue(log.urine_color_unusual)}
          />
        </dl>

        {log.note && <p className={styles.note}>{log.note}</p>}

        <div className={styles.actions}>
          <Button variant="primary" size="large" isFullWidth onClick={onEdit}>
            수정
          </Button>
          <Button variant="destructive" size="large" isFullWidth onClick={onDelete}>
            삭제
          </Button>
          <Button variant="secondary" appearance="ghost" size="large" isFullWidth onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </BottomModal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatBooleanValue(value: boolean | null) {
  if (value === true) {
    return "예";
  }

  if (value === false) {
    return "아니오";
  }

  return "미기록";
}

function formatNullableValue(value: string | null) {
  return value || "미기록";
}
