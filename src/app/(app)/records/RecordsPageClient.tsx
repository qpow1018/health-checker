"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listHealthRecords } from "@/api/healthRecords";
import type { THealthRecordRow } from "@/api/healthRecords/type";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";

import {
  formatRecordTime,
  getRecordCategoryLabel,
  getRecordDescription,
  groupRecordsByDate,
} from "./_util/healthRecordsPresentation";

import styles from "./recordsPageClient.module.scss";

export function RecordsPageClient() {
  const [records, setRecords] = useState<THealthRecordRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

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
    <main className={styles["records-page-content"]} aria-label="기록 보기 화면">
      <div className={styles["app-canvas"]}>
        <header className={styles["page-header"]}>
          <h1>기록 보기</h1>
        </header>

        {isLoading && <p className={styles["status-message"]}>기록을 불러오는 중입니다.</p>}

        {errorMessage && <p className={styles["error-message"]}>{errorMessage}</p>}

        {!isLoading && !errorMessage && records.length === 0 && (
          <section className={styles["empty-state"]} aria-label="빈 기록">
            <h2>아직 저장된 기록이 없습니다.</h2>
            <p>기록 화면에서 첫 기록을 남기면 여기에 표시됩니다.</p>
            <Link className={styles["record-link"]} href="/record">
              기록하러 가기
            </Link>
          </section>
        )}

        {!isLoading && !errorMessage && records.length > 0 && (
          <section className={styles["record-list"]} aria-label="최근 기록 목록">
            {recordGroups.map((group) => (
              <section className={styles["date-section"]} key={group.dateKey}>
                <h2 className={styles["date-heading"]}>{group.dateLabel}</h2>
                <div className={styles["date-records"]}>
                  {group.records.map((record) => {
                    const description = getRecordDescription(record);

                    return (
                      <article className={styles["record-item"]} key={record.id}>
                        <div className={styles["record-content"]}>
                          <span className={styles["record-category"]}>
                            {getRecordCategoryLabel(record)}
                          </span>
                          {description && (
                            <p className={styles["record-description"]}>{description}</p>
                          )}
                        </div>
                        <time className={styles["record-time"]} dateTime={record.recorded_at}>
                          {formatRecordTime(record.recorded_at)}
                        </time>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
        )}

        <BottomNavigation />
      </div>
    </main>
  );
}
