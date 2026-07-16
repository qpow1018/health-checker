"use client";

import { useEffect, useState } from "react";

import { listHealthRecords } from "@/api/healthRecords";
import type { THealthRecordRow } from "@/api/healthRecords/type";
import BoxLoading from "@/components/common/loading/BoxLoading";

import { PREVIEW_RECORDS } from "./_define/previewRecords";
import { groupRecordsByDate } from "./_util/healthRecordsPresentation";

import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import RecordDateSection from "./_component/RecordDateSection";

import styles from "./recordsPageClient.module.scss";

export function RecordsPageClient() {
  const [records, setRecords] = useState<THealthRecordRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const isPreviewMode =
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("preview") === "1";

    if (isPreviewMode) {
      setRecords(PREVIEW_RECORDS);
      setIsLoading(false);

      return () => {
        isActive = false;
      };
    }

    async function loadRecords() {
      try {
        const nextRecords = await listHealthRecords();

        if (isActive) {
          setRecords(nextRecords);
        }
      } catch {
        if (isActive) {
          setErrorMessage("기록을 불러오지 못했습니다. 다시 시도해 주세요.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      isActive = false;
    };
  }, []);

  const recordGroups = groupRecordsByDate(records);

  return (
    <main
      className={styles["records-page-content"]}
      aria-label="기록 보기 화면"
    >
      <header className={styles["page-title-box"]}>
        <h1>기록 보기</h1>
      </header>

      {isLoading && (
        <div role="status" aria-label="기록을 불러오는 중">
          <BoxLoading />
        </div>
      )}

      {errorMessage && (
        <p className={styles["error-message"]}>{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && records.length > 0 && (
        <section className={styles["record-list"]} aria-label="최근 기록 목록">
          {recordGroups.map((group) => (
            <RecordDateSection
              dateLabel={group.dateLabel}
              key={group.dateKey}
              records={group.records}
            />
          ))}
        </section>
      )}

      <BottomNavigation />
    </main>
  );
}
