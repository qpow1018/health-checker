import { RECORD_KIND_LABEL } from "@/app/(app)/record/_define/recordOptions";
import type { TJustSavedBathroomLog } from "@/app/(app)/record/_type/bathroomLog";

import BottomModal from "@/components/common/bottomModal/BottomModal";

import styles from "./recordSavedSummaryModal.module.scss";

type TRecordSavedSummaryModalProps = {
  log: TJustSavedBathroomLog;
  isUndoing: boolean;
  onAddDetails: () => void;
  onUndo: () => void;
  onClose: () => void;
};

export function RecordSavedSummaryModal({
  log,
  isUndoing,
  onAddDetails,
  onUndo,
  onClose,
}: TRecordSavedSummaryModalProps) {
  return (
    <BottomModal title="방금 저장됨" isOpen={true} onClose={onClose}>
      <div className={styles["saved-summary-modal"]}>
        <div className={styles["summary-row"]}>
          <span className={styles["summary-label"]}>저장된 기록</span>
          <div className={styles["sheet-summary"]}>
            <strong>{RECORD_KIND_LABEL[log.kind]}</strong>
            <span>{formatSavedTime(log.logged_at)}</span>
          </div>
        </div>
        <div className={styles["sheet-actions"]}>
          <button
            className={styles["primary-action"]}
            type="button"
            onClick={onAddDetails}
          >
            상세 추가
          </button>
          <button
            className={styles["secondary-action"]}
            type="button"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className={styles["undo-action-row"]}>
          <button
            className={styles["quiet-action"]}
            type="button"
            onClick={onUndo}
            disabled={isUndoing}
          >
            방금 저장한 기록 취소
          </button>
        </div>
      </div>
    </BottomModal>
  );
}

function formatSavedTime(loggedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(loggedAt));
}
