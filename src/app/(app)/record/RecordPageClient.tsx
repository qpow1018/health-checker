"use client";

import { useState } from "react";
import Link from "next/link";

import {
  createBathroomLog,
  deleteBathroomLog,
  updateBathroomLogDetails,
} from "@/api/bathroomLogs";
import { useAuthSession } from "@/components/auth/AuthGate";
import {
  BOTTOM_TABS,
  RECORD_KIND_LABEL,
  RECORD_KIND_OPTIONS,
  STOOL_STATE_OPTIONS,
  URGENCY_OPTIONS,
} from "./_define/recordOptions";
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

type TSheetMode = "summary" | "detail";

const SAVE_ERROR_MESSAGE = "기록을 저장하지 못했습니다. 다시 시도해 주세요.";
const UNDO_ERROR_MESSAGE =
  "취소가 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.";
const DETAIL_ERROR_MESSAGE =
  "상세 내용을 저장하지 못했습니다. 다시 시도해 주세요.";

export function RecordPageClient() {
  const { email, signOut } = useAuthSession();
  const [justSavedLog, setJustSavedLog] =
    useState<TJustSavedBathroomLog | null>(null);
  const [sheetMode, setSheetMode] = useState<TSheetMode>("summary");
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
      setJustSavedLog(savedLog);
      setDetailForm(createEmptyDetailForm());
      setSheetMode("summary");
      setStatusMessage(`${RECORD_KIND_LABEL[kind]} 기록을 저장했습니다.`);
    } catch {
      setJustSavedLog(null);
      setStatusMessage("");
      setErrorMessage(SAVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUndo() {
    if (!justSavedLog) {
      return;
    }

    setErrorMessage("");
    setIsUndoing(true);

    try {
      await deleteBathroomLog(justSavedLog.id);
      setJustSavedLog(null);
      setStatusMessage("방금 저장한 기록을 취소했습니다.");
    } catch {
      setErrorMessage(UNDO_ERROR_MESSAGE);
    } finally {
      setIsUndoing(false);
    }
  }

  async function handleSaveDetails() {
    if (!justSavedLog) {
      return;
    }

    setErrorMessage("");
    setIsSavingDetails(true);

    try {
      await updateBathroomLogDetails(
        justSavedLog.id,
        createBathroomLogDetailUpdateRequest(justSavedLog.kind, detailForm),
      );
      setJustSavedLog(null);
      setStatusMessage("상세 내용을 저장했습니다.");
    } catch {
      setErrorMessage(DETAIL_ERROR_MESSAGE);
    } finally {
      setIsSavingDetails(false);
    }
  }

  function handleCloseSheet() {
    setJustSavedLog(null);
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
            <h1>빠르게 기록하고 필요하면 덧붙이기</h1>
          </div>
          <button
            className={styles["ghost-button"]}
            type="button"
            onClick={() => void signOut()}
          >
            로그아웃
          </button>
        </header>

        <p className={styles["account"]}>{email}</p>

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
              <small>{option.description}</small>
            </button>
          ))}
        </section>

        <p className={styles["helper-text"]}>
          저장하면 바로 완료되고, 상세 입력은 이어서 선택할 수 있습니다.
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

        {justSavedLog ? (
          <section
            className={styles["bottom-sheet"]}
            role="dialog"
            aria-label="방금 저장된 기록"
          >
            {sheetMode === "summary" ? (
              <>
                <div className={styles["sheet-handle"]} />
                <p className={styles["sheet-eyebrow"]}>방금 저장됨</p>
                <div className={styles["sheet-summary"]}>
                  <strong>{RECORD_KIND_LABEL[justSavedLog.kind]}</strong>
                  <span>{formatSavedTime(justSavedLog.logged_at)}</span>
                </div>
                <div className={styles["sheet-actions"]}>
                  <button type="button" onClick={() => setSheetMode("detail")}>
                    상세 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUndo()}
                    disabled={isUndoing}
                  >
                    취소
                  </button>
                  <button type="button" onClick={handleCloseSheet}>
                    닫기
                  </button>
                </div>
              </>
            ) : (
              <div className={styles["detail-form"]}>
                <div className={styles["sheet-handle"]} />
                <p className={styles["sheet-eyebrow"]}>상세 추가</p>
                <label>
                  긴급도
                  <select
                    value={detailForm.urgency}
                    onChange={(event) =>
                      updateDetailForm({
                        urgency: event.target
                          .value as TRecordDetailFormState["urgency"],
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
                      updateDetailForm({
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
                {showsUrineFields(justSavedLog.kind) ? (
                  <div className={styles["check-group"]}>
                    <label>
                      <input
                        type="checkbox"
                        checked={detailForm.urinePain}
                        onChange={(event) =>
                          updateDetailForm({ urinePain: event.target.checked })
                        }
                      />
                      소변 통증
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={detailForm.urineColorUnusual}
                        onChange={(event) =>
                          updateDetailForm({
                            urineColorUnusual: event.target.checked,
                          })
                        }
                      />
                      색이 평소와 다름
                    </label>
                  </div>
                ) : null}
                {showsBowelFields(justSavedLog.kind) ? (
                  <>
                    <label>
                      대변 상태
                      <select
                        value={detailForm.stoolState}
                        onChange={(event) =>
                          updateDetailForm({
                            stoolState: event.target
                              .value as TRecordDetailFormState["stoolState"],
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
                          onChange={(event) =>
                            updateDetailForm({
                              bowelPain: event.target.checked,
                            })
                          }
                        />
                        대변 통증
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={detailForm.possibleBlood}
                          onChange={(event) =>
                            updateDetailForm({
                              possibleBlood: event.target.checked,
                            })
                          }
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
                    onChange={(event) =>
                      updateDetailForm({ note: event.target.value })
                    }
                    rows={3}
                  />
                </label>
                <div className={styles["sheet-actions"]}>
                  <button
                    type="button"
                    onClick={() => void handleSaveDetails()}
                    disabled={isSavingDetails}
                  >
                    상세 저장
                  </button>
                  <button type="button" onClick={() => setSheetMode("summary")}>
                    뒤로
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}

        <nav className={styles["bottom-tabs"]} aria-label="하단 탭">
          {BOTTOM_TABS.map((tab) => (
            <Link
              className={
                tab.href === "/record" ? styles["active-tab"] : undefined
              }
              href={tab.href}
              key={tab.href}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

function showsUrineFields(kind: TBathroomLogKind) {
  return kind === "urine" || kind === "both";
}

function showsBowelFields(kind: TBathroomLogKind) {
  return kind === "bowel" || kind === "both";
}

function formatSavedTime(loggedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(loggedAt));
}
