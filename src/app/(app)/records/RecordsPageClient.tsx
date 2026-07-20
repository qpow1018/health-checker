"use client";

import BoxLoading from "@/components/common/loading/BoxLoading";
import { useHealthRecords } from "@/queries/healthRecordsQuery";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import { RECORD_CATEGORY_FILTERS } from "./_define/recordCategoryFilters";
import { PREVIEW_RECORDS } from "./_define/previewRecords";
import type { TRecordCategoryFilter } from "./_type/recordCategoryFilter";
import { isRecordCategoryFilter } from "./_util/recordCategoryFilter";
import { groupRecordsByDate } from "./_util/recordsGrouping";
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
  const requestedCategory = searchParams.get("category");
  const selectedCategory = isRecordCategoryFilter(requestedCategory)
    ? requestedCategory
    : "all";
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
  const filteredRecords =
    selectedCategory === "all"
      ? records
      : records.filter((record) => record.category === selectedCategory);

  const recordGroups = groupRecordsByDate(filteredRecords);

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

  function handleCategoryChange(category: TRecordCategoryFilter) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      nextSearchParams.delete("category");
    } else {
      nextSearchParams.set("category", category);
    }

    const query = nextSearchParams.toString();
    router.replace(query ? `/records?${query}` : "/records", { scroll: false });
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

      <div
        className={styles["category-filter"]}
        role="group"
        aria-label="기록 종류 선택"
      >
        {RECORD_CATEGORY_FILTERS.map((filter) => (
          <button
            aria-pressed={selectedCategory === filter.value}
            key={filter.value}
            onClick={() => handleCategoryChange(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div role="status" aria-label="기록을 불러오는 중">
          <BoxLoading />
        </div>
      )}

      {errorMessage && (
        <p className={styles["error-message"]}>{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && filteredRecords.length > 0 && (
        <section className={styles["record-list"]} aria-label="최근 기록 목록">
          {recordGroups.map((group) => (
            <RecordDateSection
              dateLabel={group.dateLabel}
              key={group.dateKey}
              monthKey={selectedMonthKey}
              records={group.records}
              selectedCategory={selectedCategory}
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

      {!isLoading &&
        !errorMessage &&
        records.length > 0 &&
        filteredRecords.length === 0 && (
          <section className={styles["empty-state"]} aria-label="빈 필터 결과">
            <p>선택한 종류의 기록이 없어요.</p>
            <button type="button" onClick={() => handleCategoryChange("all")}>
              전체 기록 보기
            </button>
          </section>
        )}

      <BottomNavigation />
    </main>
  );
}
