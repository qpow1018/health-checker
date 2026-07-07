import BottomModal from "@/components/common/BottomModal";
import {
  STOOL_STATE_OPTIONS,
  URGENCY_OPTIONS,
} from "@/app/(app)/record/_define/recordOptions";
import type {
  TBathroomLogKind,
  TRecordDetailFormState,
} from "@/app/(app)/record/_type/bathroomLog";

import styles from "./recordDetailModal.module.scss";

type TRecordDetailModalProps = {
  kind: TBathroomLogKind;
  detailForm: TRecordDetailFormState;
  isSavingDetails: boolean;
  onChange: (nextForm: Partial<TRecordDetailFormState>) => void;
  onSave: () => void;
  onBack: () => void;
};

export function RecordDetailModal({
  kind,
  detailForm,
  isSavingDetails,
  onChange,
  onSave,
  onBack,
}: TRecordDetailModalProps) {
  return (
    <BottomModal title="상세 추가" isOpen={true} onClose={onBack}>
      <div className={styles["detail-form"]}>
        <label>
          긴급도
          <select
            value={detailForm.urgency}
            onChange={(event) =>
              onChange({
                urgency: event.target.value as TRecordDetailFormState["urgency"],
              })
            }
          >
            <option value="">미기록</option>
            {URGENCY_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          자다가 깼음
          <select
            value={detailForm.wokeFromSleep}
            onChange={(event) =>
              onChange({
                wokeFromSleep: event.target
                  .value as TRecordDetailFormState["wokeFromSleep"],
              })
            }
          >
            <option value="">미기록</option>
            <option value="yes">예</option>
            <option value="no">아니오</option>
          </select>
        </label>
        {showsUrineFields(kind) ? (
          <div className={styles["check-group"]}>
            <label>
              <input
                type="checkbox"
                checked={detailForm.urinePain}
                onChange={(event) => onChange({ urinePain: event.target.checked })}
              />
              소변 통증
            </label>
            <label>
              <input
                type="checkbox"
                checked={detailForm.urineColorUnusual}
                onChange={(event) =>
                  onChange({
                    urineColorUnusual: event.target.checked,
                  })
                }
              />
              색이 평소와 다름
            </label>
          </div>
        ) : null}
        {showsBowelFields(kind) ? (
          <>
            <label>
              대변 상태
              <select
                value={detailForm.stoolState}
                onChange={(event) =>
                  onChange({
                    stoolState: event.target.value as TRecordDetailFormState["stoolState"],
                  })
                }
              >
                <option value="">미기록</option>
                {STOOL_STATE_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles["check-group"]}>
              <label>
                <input
                  type="checkbox"
                  checked={detailForm.bowelPain}
                  onChange={(event) => onChange({ bowelPain: event.target.checked })}
                />
                대변 통증
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={detailForm.possibleBlood}
                  onChange={(event) => onChange({ possibleBlood: event.target.checked })}
                />
                혈변 의심
              </label>
            </div>
          </>
        ) : null}
        <label>
          메모
          <textarea
            value={detailForm.note}
            onChange={(event) => onChange({ note: event.target.value })}
            rows={3}
          />
        </label>
        <div className={styles["sheet-actions"]}>
          <button type="button" onClick={onSave} disabled={isSavingDetails}>
            상세 저장
          </button>
          <button type="button" onClick={onBack}>
            뒤로
          </button>
        </div>
      </div>
    </BottomModal>
  );
}

function showsUrineFields(kind: TBathroomLogKind) {
  return kind === "urine" || kind === "both";
}

function showsBowelFields(kind: TBathroomLogKind) {
  return kind === "bowel" || kind === "both";
}
