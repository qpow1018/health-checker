"use client";

import { useState } from "react";

import {
  createBathroomLog,
  deleteBathroomLog,
  updateBathroomLogDetails,
} from "@/api/bathroomLogs";
import { BottomNavigation } from "@/components/common/bottomNavigation/BottomNavigation";
import { RecordDetailModal } from "@/app/(app)/record/_component/RecordDetailModal";
import { RecordSavedSummaryModal } from "@/app/(app)/record/_component/RecordSavedSummaryModal";
import { RECORD_KIND_LABEL, RECORD_KIND_OPTIONS } from "./_define/recordOptions";
import type {
  TBathroomLogKind,
  TJustSavedBathroomLog,
  TRecordDetailFormState,
} from "./_type/bathroomLog";
import {
  createEmptyDetailForm,
  createBathroomLogDetailUpdateRequest,
} from "./_util/recordDetailForm";

import styles from "./recordPageClient.module.scss";

const SAVE_ERROR_MESSAGE = "기록을 저장하지 못했습니다. 다시 시도해 주세요.";
const UNDO_ERROR_MESSAGE =
  "취소가 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.";
const DETAIL_ERROR_MESSAGE =
  "상세 내용을 저장하지 못했습니다. 다시 시도해 주세요.";

export function RecordPageClient() {
  const [summaryLog, setSummaryLog] =
    useState<TJustSavedBathroomLog | null>(null);
  const [detailLog, setDetailLog] =
    useState<TJustSavedBathroomLog | null>(null);
  const [detailForm, setDetailForm] = useState<TRecordDetailFormState>(() =>
    createEmptyDetailForm(),
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  async function handleQuickRecord(kind: TBathroomLogKind) {
    setErrorMessage("");
    setStatusMessage("");
    setIsSaving(true);

    try {
      const savedLog = await createBathroomLog({ kind });
      setSummaryLog(savedLog);
      setDetailLog(null);
      setDetailForm(createEmptyDetailForm());
      setStatusMessage(`${RECORD_KIND_LABEL[kind]} 기록을 저장했습니다.`);
    } catch {
      setSummaryLog(null);
      setDetailLog(null);
      setStatusMessage("");
      setErrorMessage(SAVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUndo() {
    if (!summaryLog) {
      return;
    }

    setErrorMessage("");
    setIsUndoing(true);

    try {
      await deleteBathroomLog(summaryLog.id);
      setSummaryLog(null);
      setStatusMessage("방금 저장한 기록을 취소했습니다.");
    } catch {
      setErrorMessage(UNDO_ERROR_MESSAGE);
    } finally {
      setIsUndoing(false);
    }
  }

  async function handleSaveDetails() {
    if (!detailLog) {
      return;
    }

    setErrorMessage("");
    setIsSavingDetails(true);

    try {
      await updateBathroomLogDetails(
        detailLog.id,
        createBathroomLogDetailUpdateRequest(detailLog.kind, detailForm),
      );
      setDetailLog(null);
      setStatusMessage("상세 내용을 저장했습니다.");
    } catch {
      setErrorMessage(DETAIL_ERROR_MESSAGE);
    } finally {
      setIsSavingDetails(false);
    }
  }

  function handleOpenDetails() {
    if (!summaryLog) {
      return;
    }

    setErrorMessage("");
    setDetailLog(summaryLog);
    setSummaryLog(null);
  }

  function handleBackToSummary() {
    if (!detailLog) {
      return;
    }

    setErrorMessage("");
    setSummaryLog(detailLog);
    setDetailLog(null);
  }

  function handleCloseSummary() {
    setSummaryLog(null);
    setErrorMessage("");
  }

  function updateDetailForm(nextForm: Partial<TRecordDetailFormState>) {
    setDetailForm((currentForm) => ({
      ...currentForm,
      ...nextForm,
    }));
  }

  return (
    <main className={styles["record-page-content"]} aria-label="기록 화면">
      <div className={styles["app-canvas"]}>
        <header className={styles["topbar"]}>
          <div className={styles["topbar-title"]}>
            <p className={styles["eyebrow"]}>오늘 기록</p>
            <h1>방금 다녀온 기록을 남겨요</h1>
            <p className={styles["topbar-description"]}>
              저장 후 필요한 내용만 이어서 적을 수 있습니다.
            </p>
          </div>
        </header>

        <section className={styles["quick-section"]} aria-label="빠른 기록">
          {RECORD_KIND_OPTIONS.map((option) => (
            <button
              className={`${styles["record-button"]} ${styles[option.kind]}`}
              type="button"
              key={option.kind}
              onClick={() => void handleQuickRecord(option.kind)}
              disabled={isSaving}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </section>

        <p className={styles["helper-text"]}>
          탭하면 지금 시각으로 바로 저장됩니다.
        </p>

        {statusMessage ? (
          <p className={styles["status-message"]} role="status">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className={styles["error-message"]} role="status">
            {errorMessage}
          </p>
        ) : null}

        {summaryLog ? (
          <RecordSavedSummaryModal
            log={summaryLog}
            isUndoing={isUndoing}
            onAddDetails={handleOpenDetails}
            onUndo={() => void handleUndo()}
            onClose={handleCloseSummary}
          />
        ) : null}

        {detailLog ? (
          <RecordDetailModal
            kind={detailLog.kind}
            detailForm={detailForm}
            isSavingDetails={isSavingDetails}
            onChange={updateDetailForm}
            onSave={() => void handleSaveDetails()}
            onBack={handleBackToSummary}
          />
        ) : null}

        <BottomNavigation activeHref="/record" />
      </div>
    </main>
  );
}
