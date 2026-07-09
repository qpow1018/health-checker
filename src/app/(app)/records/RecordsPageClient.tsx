"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  deleteBathroomLog,
  listBathroomLogs,
  listBathroomLogsByRange,
  updateBathroomLogDetails,
} from "@/api/bathroomLogs";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import { RECORD_KIND_LABEL } from "@/app/(app)/record/_define/recordOptions";
import type { TRecordDetailFormState } from "@/app/(app)/record/_type/bathroomLog";
import type { TRecordsView } from "@/app/(app)/records/_type/recordsCalendar";
import {
  createMonthKey,
  createMonthRange,
  filterLogsByDateKey,
  formatRecordDateKey,
} from "@/app/(app)/records/_util/recordsCalendar";
import { BottomNavigation } from "@/components/common/bottomNavigation/BottomNavigation";
import { ConfirmModal } from "@/components/common/confirmModal/ConfirmModal";
import { Tabs } from "@/components/common/tabs/Tabs";
import { RecordsCalendarSummary } from "./_component/RecordsCalendarSummary";
import { RecordsDetailModal } from "./_component/RecordsDetailModal";
import { RecordsEditModal } from "./_component/RecordsEditModal";
import {
  createRecordDetailFormFromLog,
  createRecordUpdateRequest,
  formatRecordDateLabel,
  formatRecordTimeLabel,
  hasRecordDetails,
} from "./_util/recordsPresentation";

import styles from "./recordsPageClient.module.scss";

const LOAD_ERROR_MESSAGE = "기록을 불러오지 못했습니다. 다시 시도해 주세요.";
const CALENDAR_LOAD_ERROR_MESSAGE =
  "달력 기록을 불러오지 못했습니다. 다시 시도해 주세요.";
const UPDATE_ERROR_MESSAGE = "기록 상세를 수정하지 못했습니다. 다시 시도해 주세요.";
const DELETE_ERROR_MESSAGE = "기록을 삭제하지 못했습니다. 다시 시도해 주세요.";
const RECORDS_TABS = [
  { value: "summary", label: "요약보기" },
  { value: "details", label: "상세보기" },
] as const;

export function RecordsPageClient() {
  const initialMonthKey = formatRecordDateKey(new Date().toISOString()).slice(0, 7);
  const [initialYear, initialMonth] = initialMonthKey.split("-").map(Number);
  const [activeView, setActiveView] = useState<TRecordsView>("summary");
  const [visibleMonth, setVisibleMonth] = useState({
    year: initialYear,
    monthIndex: initialMonth - 1,
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<TBathroomLogRow[]>([]);
  const [calendarLogs, setCalendarLogs] = useState<TBathroomLogRow[]>([]);
  const monthCacheRef = useRef<Record<string, TBathroomLogRow[]>>({});
  const updatedLogsRef = useRef<Record<string, Partial<TBathroomLogRow>>>({});
  const deletedLogIdsRef = useRef<Set<string>>(new Set());
  const [selectedLog, setSelectedLog] = useState<TBathroomLogRow | null>(null);
  const [editingLog, setEditingLog] = useState<TBathroomLogRow | null>(null);
  const [deleteTargetLog, setDeleteTargetLog] = useState<TBathroomLogRow | null>(null);
  const [detailForm, setDetailForm] = useState<TRecordDetailFormState | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");
  const [recentErrorMessage, setRecentErrorMessage] = useState("");
  const [calendarErrorMessage, setCalendarErrorMessage] = useState("");
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadRecentLogs() {
      setIsRecentLoading(true);
      setRecentErrorMessage("");

      try {
        const nextLogs = await listBathroomLogs({ limit: 50 });

        if (isActive) {
          setRecentLogs(
            reconcileFetchedLogs(
              nextLogs,
              updatedLogsRef.current,
              deletedLogIdsRef.current,
            ),
          );
        }
      } catch {
        if (isActive) {
          setRecentErrorMessage(LOAD_ERROR_MESSAGE);
        }
      } finally {
        if (isActive) {
          setIsRecentLoading(false);
        }
      }
    }

    void loadRecentLogs();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const monthKey = createMonthKey(visibleMonth.year, visibleMonth.monthIndex);
    const cachedLogs = monthCacheRef.current[monthKey];

    if (cachedLogs) {
      setCalendarLogs(cachedLogs);
      setCalendarErrorMessage("");
      setIsCalendarLoading(false);
      return () => {
        isActive = false;
      };
    }

    async function loadCalendarLogs() {
      setIsCalendarLoading(true);
      setCalendarErrorMessage("");

      try {
        const nextLogs = await listBathroomLogsByRange(
          createMonthRange(visibleMonth.year, visibleMonth.monthIndex),
        );

        if (isActive) {
          const reconciledLogs = reconcileFetchedLogs(
            nextLogs,
            updatedLogsRef.current,
            deletedLogIdsRef.current,
          );

          monthCacheRef.current[monthKey] = reconciledLogs;
          setCalendarLogs(reconciledLogs);
        }
      } catch {
        if (isActive) {
          setCalendarLogs([]);
          setCalendarErrorMessage(CALENDAR_LOAD_ERROR_MESSAGE);
        }
      } finally {
        if (isActive) {
          setIsCalendarLoading(false);
        }
      }
    }

    void loadCalendarLogs();

    return () => {
      isActive = false;
    };
  }, [visibleMonth]);

  const detailLogs = selectedDateKey
    ? filterLogsByDateKey(calendarLogs, selectedDateKey)
    : recentLogs;
  const groupedLogs = useMemo(() => groupLogsByDate(detailLogs), [detailLogs]);

  function handleViewChange(view: TRecordsView) {
    setActiveView(view);

    if (view === "details") {
      setSelectedDateKey(null);
    }
  }

  function handleChangeMonth(offset: number) {
    setVisibleMonth((currentMonth) => {
      const nextMonth = new Date(
        Date.UTC(currentMonth.year, currentMonth.monthIndex + offset, 1),
      );

      return {
        year: nextMonth.getUTCFullYear(),
        monthIndex: nextMonth.getUTCMonth(),
      };
    });
  }

  function handleSelectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
    setActiveView("details");
  }

  function handleOpenDetails(log: TBathroomLogRow) {
    setStatusMessage("");
    setActionErrorMessage("");
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
    setActionErrorMessage("");

    try {
      const updatePayload = createRecordUpdateRequest(editingLog.kind, detailForm);
      await updateBathroomLogDetails(editingLog.id, updatePayload);
      updatedLogsRef.current[editingLog.id] = {
        ...updatedLogsRef.current[editingLog.id],
        ...updatePayload,
      };
      const updateLog = (log: TBathroomLogRow) =>
        log.id === editingLog.id ? { ...log, ...updatePayload } : log;

      setRecentLogs((currentLogs) => currentLogs.map(updateLog));
      setCalendarLogs((currentLogs) => currentLogs.map(updateLog));
      updateCachedMonths((logs) => logs.map(updateLog));
      setEditingLog(null);
      setDetailForm(null);
      setStatusMessage("기록 상세를 수정했습니다.");
    } catch {
      setActionErrorMessage(UPDATE_ERROR_MESSAGE);
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
    setActionErrorMessage("");

    try {
      await deleteBathroomLog(deleteTargetLog.id);
      deletedLogIdsRef.current.add(deleteTargetLog.id);
      const removeLog = (log: TBathroomLogRow) => log.id !== deleteTargetLog.id;

      setRecentLogs((currentLogs) => currentLogs.filter(removeLog));
      setCalendarLogs((currentLogs) => currentLogs.filter(removeLog));
      updateCachedMonths((logs) => logs.filter(removeLog));
      setSelectedLog(null);
      setDeleteTargetLog(null);
      setStatusMessage("기록을 삭제했습니다.");
    } catch {
      setActionErrorMessage(DELETE_ERROR_MESSAGE);
    } finally {
      setIsDeleting(false);
    }
  }

  function updateCachedMonths(
    updateLogs: (logs: TBathroomLogRow[]) => TBathroomLogRow[],
  ) {
    Object.entries(monthCacheRef.current).forEach(([monthKey, logs]) => {
      monthCacheRef.current[monthKey] = updateLogs(logs);
    });
  }

  function updateDetailForm(nextForm: Partial<TRecordDetailFormState>) {
    setDetailForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return { ...currentForm, ...nextForm };
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

        <Tabs
          idPrefix="records"
          label="기록 보기 방식"
          tabs={RECORDS_TABS}
          value={activeView}
          onChange={handleViewChange}
        />

        {statusMessage && (
          <p className={styles["status-message"]} role="status">
            {statusMessage}
          </p>
        )}

        {actionErrorMessage && (
          <p className={styles["error-message"]} role="status">
            {actionErrorMessage}
          </p>
        )}

        {activeView === "summary" && (
          <div
            className={styles["tab-panel"]}
            id="records-summary-panel"
            role="tabpanel"
            aria-labelledby="records-summary-tab"
          >
            <RecordsCalendarSummary
              year={visibleMonth.year}
              monthIndex={visibleMonth.monthIndex}
              logs={calendarLogs}
              isLoading={isCalendarLoading}
              errorMessage={calendarErrorMessage}
              onPreviousMonth={() => handleChangeMonth(-1)}
              onNextMonth={() => handleChangeMonth(1)}
              onSelectDate={handleSelectDate}
            />
          </div>
        )}

        {activeView === "details" && (
          <div
            className={styles["tab-panel"]}
            id="records-details-panel"
            role="tabpanel"
            aria-labelledby="records-details-tab"
          >
            {selectedDateKey && (
              <header className={styles["filter-header"]}>
                <h2>{formatSelectedDateLabel(selectedDateKey)}</h2>
                <button type="button" onClick={() => setSelectedDateKey(null)}>
                  전체 보기
                </button>
              </header>
            )}

            {selectedDateKey && detailLogs.length === 0 && (
              <p className={styles["status-message"]}>
                이 날짜에는 기록이 없습니다.
              </p>
            )}

            {!selectedDateKey && isRecentLoading && (
              <p className={styles["status-message"]} role="status">
                기록을 불러오는 중입니다.
              </p>
            )}

            {!selectedDateKey && recentErrorMessage && !isRecentLoading && (
              <p className={styles["error-message"]} role="status">
                {recentErrorMessage}
              </p>
            )}

            {!isRecentLoading &&
              !recentErrorMessage &&
              !selectedDateKey &&
              detailLogs.length === 0 && (
                <section className={styles["empty-state"]} aria-label="빈 기록">
                  <h2>아직 저장된 기록이 없습니다.</h2>
                  <p>기록 화면에서 첫 기록을 남기면 여기에 표시됩니다.</p>
                  <Link className={styles["record-link"]} href="/record">
                    기록하러 가기
                  </Link>
                </section>
              )}

            {(selectedDateKey || (!isRecentLoading && !recentErrorMessage)) &&
              detailLogs.length > 0 && (
                <div className={styles["record-groups"]}>
                  {groupedLogs.map((group) => (
                    <section className={styles["record-group"]} key={group.dateLabel}>
                      {!selectedDateKey && <h2>{group.dateLabel}</h2>}
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

function formatSelectedDateLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-").map(Number);

  return `${month}월 ${day}일 기록`;
}

function reconcileFetchedLogs(
  logs: readonly TBathroomLogRow[],
  updatedLogs: Readonly<Record<string, Partial<TBathroomLogRow>>>,
  deletedLogIds: ReadonlySet<string>,
) {
  return logs
    .filter((log) => !deletedLogIds.has(log.id))
    .map((log) => ({ ...log, ...updatedLogs[log.id] }));
}

function groupLogsByDate(logs: readonly TBathroomLogRow[]) {
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
