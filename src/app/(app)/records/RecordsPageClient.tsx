"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  deleteBathroomLog,
  listBathroomLogs,
  updateBathroomLogDetails,
} from "@/api/bathroomLogs";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import { RECORD_KIND_LABEL } from "@/app/(app)/record/_define/recordOptions";
import type { TRecordDetailFormState } from "@/app/(app)/record/_type/bathroomLog";
import { BottomNavigation } from "@/components/common/bottomNavigation/BottomNavigation";
import { ConfirmModal } from "@/components/common/confirmModal/ConfirmModal";
import {
  createRecordDetailFormFromLog,
  createRecordUpdateRequest,
  formatRecordDateLabel,
  formatRecordTimeLabel,
  hasRecordDetails,
} from "./_util/recordsPresentation";
import { RecordsDetailModal } from "./_component/RecordsDetailModal";
import { RecordsEditModal } from "./_component/RecordsEditModal";

import styles from "./recordsPageClient.module.scss";

const LOAD_ERROR_MESSAGE = "기록을 불러오지 못했습니다. 다시 시도해 주세요.";
const UPDATE_ERROR_MESSAGE = "기록 상세를 수정하지 못했습니다. 다시 시도해 주세요.";
const DELETE_ERROR_MESSAGE = "기록을 삭제하지 못했습니다. 다시 시도해 주세요.";

export function RecordsPageClient() {
  const [logs, setLogs] = useState<TBathroomLogRow[]>([]);
  const [selectedLog, setSelectedLog] = useState<TBathroomLogRow | null>(null);
  const [editingLog, setEditingLog] = useState<TBathroomLogRow | null>(null);
  const [deleteTargetLog, setDeleteTargetLog] = useState<TBathroomLogRow | null>(null);
  const [detailForm, setDetailForm] = useState<TRecordDetailFormState | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadLogs() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextLogs = await listBathroomLogs({ limit: 50 });

        if (isActive) {
          setLogs(nextLogs);
        }
      } catch {
        if (isActive) {
          setErrorMessage(LOAD_ERROR_MESSAGE);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      isActive = false;
    };
  }, []);

  const groupedLogs = useMemo(() => groupLogsByDate(logs), [logs]);

  function handleOpenDetails(log: TBathroomLogRow) {
    setStatusMessage("");
    setErrorMessage("");
    setSelectedLog(log);
  }

  function handleStartEdit(log: TBathroomLogRow) {
    setSelectedLog(null);
    setEditingLog(log);
    setDetailForm(createRecordDetailFormFromLog(log));
  }

  async function handleSaveEdit() {
    if (!editingLog || !detailForm) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatePayload = createRecordUpdateRequest(editingLog.kind, detailForm);
      await updateBathroomLogDetails(editingLog.id, updatePayload);
      setLogs((currentLogs) =>
        currentLogs.map((log) =>
          log.id === editingLog.id ? { ...log, ...updatePayload } : log,
        ),
      );
      setEditingLog(null);
      setDetailForm(null);
      setStatusMessage("기록 상세를 수정했습니다.");
    } catch {
      setErrorMessage(UPDATE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestDelete(log: TBathroomLogRow) {
    setDeleteTargetLog(log);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetLog) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deleteBathroomLog(deleteTargetLog.id);
      setLogs((currentLogs) =>
        currentLogs.filter((log) => log.id !== deleteTargetLog.id),
      );
      setSelectedLog(null);
      setDeleteTargetLog(null);
      setStatusMessage("기록을 삭제했습니다.");
    } catch {
      setErrorMessage(DELETE_ERROR_MESSAGE);
    } finally {
      setIsDeleting(false);
    }
  }

  function updateDetailForm(nextForm: Partial<TRecordDetailFormState>) {
    setDetailForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return {
        ...currentForm,
        ...nextForm,
      };
    });
  }

  return (
    <main className={styles["records-page-content"]} aria-label="기록 보기 화면">
      <div className={styles["app-canvas"]}>
        <header className={styles.topbar}>
          <p className={styles.eyebrow}>기록 보기</p>
          <h1>저장한 기록을 확인해요</h1>
          <p className={styles["topbar-description"]}>
            최근 기록을 보고 필요한 내용만 바로 고칠 수 있습니다.
          </p>
        </header>

        {isLoading && (
          <p className={styles["status-message"]} role="status">
            기록을 불러오는 중입니다.
          </p>
        )}

        {statusMessage && !isLoading && (
          <p className={styles["status-message"]} role="status">
            {statusMessage}
          </p>
        )}

        {errorMessage && !isLoading && (
          <p className={styles["error-message"]} role="status">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && logs.length === 0 && (
          <section className={styles["empty-state"]} aria-label="빈 기록">
            <h2>아직 저장된 기록이 없습니다.</h2>
            <p>기록 화면에서 첫 기록을 남기면 여기에 표시됩니다.</p>
            <Link className={styles["record-link"]} href="/record">
              기록하러 가기
            </Link>
          </section>
        )}

        {!isLoading && logs.length > 0 && (
          <div className={styles["record-groups"]}>
            {groupedLogs.map((group) => (
              <section className={styles["record-group"]} key={group.dateLabel}>
                <h2>{group.dateLabel}</h2>
                <div className={styles["record-list"]}>
                  {group.logs.map((log) => (
                    <button
                      className={styles["record-item"]}
                      type="button"
                      onClick={() => handleOpenDetails(log)}
                      key={log.id}
                    >
                      <span className={styles["record-main"]}>
                        <span className={styles["record-time"]}>
                          {formatRecordTimeLabel(log.logged_at)}
                        </span>
                        <span className={styles["record-kind"]}>
                          {RECORD_KIND_LABEL[log.kind]}
                        </span>
                      </span>
                      <span className={styles["record-meta"]}>
                        {hasRecordDetails(log) ? "상세 있음" : "빠른 기록"}
                      </span>
                      {log.note && (
                        <span className={styles["record-note"]}>{log.note}</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {selectedLog && (
          <RecordsDetailModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
            onEdit={() => handleStartEdit(selectedLog)}
            onDelete={() => handleRequestDelete(selectedLog)}
          />
        )}

        {editingLog && detailForm && (
          <RecordsEditModal
            kind={editingLog.kind}
            detailForm={detailForm}
            isSaving={isSaving}
            onChange={updateDetailForm}
            onSave={() => void handleSaveEdit()}
            onBack={() => {
              setEditingLog(null);
              setDetailForm(null);
              setSelectedLog(editingLog);
            }}
          />
        )}

        <ConfirmModal
          isOpen={Boolean(deleteTargetLog)}
          title="기록 삭제"
          message="이 기록을 삭제할까요?"
          onClose={() => setDeleteTargetLog(null)}
          cancelButton={{
            label: "취소",
            onClick: () => setDeleteTargetLog(null),
            isDisabled: isDeleting,
          }}
          confirmButton={{
            label: "삭제",
            variant: "destructive",
            onClick: () => void handleConfirmDelete(),
            isLoading: isDeleting,
          }}
        />

        <BottomNavigation activeHref="/records" />
      </div>
    </main>
  );
}

function groupLogsByDate(logs: TBathroomLogRow[]) {
  return logs.reduce<Array<{ dateLabel: string; logs: TBathroomLogRow[] }>>(
    (groups, log) => {
      const dateLabel = formatRecordDateLabel(log.logged_at);
      const currentGroup = groups.find((group) => group.dateLabel === dateLabel);

      if (currentGroup) {
        currentGroup.logs.push(log);
        return groups;
      }

      return [...groups, { dateLabel, logs: [log] }];
    },
    [],
  );
}
