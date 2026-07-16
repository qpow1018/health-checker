"use client";

import BoxLoading from "@/components/common/loading/BoxLoading";
import { useHealthRecords } from "@/queries/healthRecordsQuery";
import { groupRecordsByDate } from "@/utils/healthRecordsPresentation";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import { PREVIEW_RECORDS } from "./_define/previewRecords";
import {
  formatRecordMonth,
  getAdjacentRecordMonth,
  getRecordMonthKey,
  getRecordMonthRange,
  isRecordMonthKey,
} from "./_util/recordsMonth";

import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import RecordDateSection from "./_component/RecordDateSection";

import styles from "./recordsPageClient.module.scss";

export function RecordsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreviewMode =
    process.env.NODE_ENV !== "production" &&
    searchParams.get("preview") === "1";
  const currentMonthKey = getRecordMonthKey();
  const requestedMonthKey = searchParams.get("month");
  const defaultMonthKey = isPreviewMode
    ? getRecordMonthKey(new Date(PREVIEW_RECORDS[0].recorded_at))
    : currentMonthKey;
  const selectedMonthKey =
    isRecordMonthKey(requestedMonthKey) && requestedMonthKey <= currentMonthKey
      ? requestedMonthKey
      : defaultMonthKey;
  const monthRange = getRecordMonthRange(selectedMonthKey);
  const { data, error, isPending } = useHealthRecords(monthRange, !isPreviewMode);
  const records = isPreviewMode
    ? PREVIEW_RECORDS.filter(
        (record) => getRecordMonthKey(new Date(record.recorded_at)) === selectedMonthKey,
      )
    : (data ?? []);
  const isLoading = !isPreviewMode && isPending;
  const errorMessage = error ? "기록을 불러오지 못했습니다. 다시 시도해 주세요." : "";
  const isCurrentMonth = selectedMonthKey === currentMonthKey;

  const recordGroups = groupRecordsByDate(records);

  function handlePreviousMonth() {
    replaceSelectedMonth(getAdjacentRecordMonth(selectedMonthKey, -1));
  }

  function handleNextMonth() {
    if (isCurrentMonth) {
      return;
    }

    replaceSelectedMonth(getAdjacentRecordMonth(selectedMonthKey, 1));
  }

  function replaceSelectedMonth(monthKey: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("month", monthKey);
    router.replace(`/records?${nextSearchParams.toString()}`, { scroll: false });
  }

  return (
    <main
      className={styles["records-page-content"]}
      aria-label="기록 보기 화면"
    >
      <header className={styles["page-title-box"]}>
        <h1>기록 보기</h1>
      </header>

      <div
        className={styles["month-filter"]}
        role="group"
        aria-label="조회 월 선택"
      >
        <button type="button" aria-label="이전 달" onClick={handlePreviousMonth}>
          <MdChevronLeft aria-hidden="true" />
        </button>
        <strong aria-live="polite">{formatRecordMonth(selectedMonthKey)}</strong>
        <button
          type="button"
          aria-label="다음 달"
          disabled={isCurrentMonth}
          onClick={handleNextMonth}
        >
          <MdChevronRight aria-hidden="true" />
        </button>
      </div>

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
              monthKey={selectedMonthKey}
              records={group.records}
            />
          ))}
        </section>
      )}

      {!isLoading && !errorMessage && records.length === 0 && (
        <section className={styles["empty-state"]} aria-label="빈 기록">
          <p>선택한 달에 기록이 없어요.</p>
          <Link href="/record">기록하러 가기</Link>
        </section>
      )}

      <BottomNavigation />
    </main>
  );
}
