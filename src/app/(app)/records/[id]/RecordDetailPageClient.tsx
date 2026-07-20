"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useDeleteHealthRecord, useHealthRecord } from "@/queries/healthRecordsQuery";

import AppHeader from "@/components/common/appHeader/AppHeader";
import Button from "@/components/common/button/Button";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";
import BoxLoading from "@/components/common/loading/BoxLoading";

import { getRecordMonthKey, isRecordMonthKey } from "@/app/(app)/records/_util/recordsMonth";
import { isRecordCategoryFilter } from "@/app/(app)/records/_util/recordCategoryFilter";
import { formatRecordTime } from "@/utils/healthRecordsPresentation";
import { getRecordDetailItems, getRecordEditPath } from "./_util/recordDetailPresentation";

import styles from "./recordDetailPageClient.module.scss";

export default function RecordDetailPageClient({ recordId }: { recordId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const { data: record, isLoading, isError } = useHealthRecord(recordId);
  const { mutateAsync: deleteHealthRecord, isPending: isDeleting } = useDeleteHealthRecord();

  async function handleDelete() {
    try {
      setDeleteErrorMessage("");
      await deleteHealthRecord(recordId);
      const monthKey = searchParams.get("month");
      const category = searchParams.get("category");
      const returnSearchParams = new URLSearchParams();

      if (isRecordMonthKey(monthKey)) {
        returnSearchParams.set("month", monthKey);
      }

      if (isRecordCategoryFilter(category) && category !== "all") {
        returnSearchParams.set("category", category);
      }

      const query = returnSearchParams.toString();
      router.replace(query ? `/records?${query}` : "/records");
    } catch {
      setIsDeleteModalOpen(false);
      setDeleteErrorMessage("기록을 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  if (isLoading) {
    return (
      <main className={styles["record-detail-page-client"]} aria-label="기록 상세 화면">
        <AppHeader title="기록 상세" />
        <BoxLoading />
      </main>
    );
  }

  if (!record || isError) {
    return (
      <main className={styles["record-detail-page-client"]} aria-label="기록 상세 화면">
        <AppHeader title="기록 상세" />
        <p className={styles["notice-message"]}>기록을 찾을 수 없습니다.</p>
      </main>
    );
  }

  const detailItems = getRecordDetailItems(record);
  const editPath = getRecordEditPath(record);
  const recordedAt = new Date(record.recorded_at);
  const requestedMonthKey = searchParams.get("month");
  const returnMonthKey = isRecordMonthKey(requestedMonthKey)
    ? requestedMonthKey
    : getRecordMonthKey(recordedAt);
  const requestedCategory = searchParams.get("category");
  const returnCategory =
    isRecordCategoryFilter(requestedCategory) && requestedCategory !== "all"
      ? requestedCategory
      : undefined;
  const editHref = editPath
    ? `${editPath}&month=${returnMonthKey}${returnCategory ? `&category=${returnCategory}` : ""}`
    : undefined;
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(recordedAt);

  return (
    <main className={styles["record-detail-page-client"]} aria-label="기록 상세 화면">
      <AppHeader title="기록 상세" />

      <div className={styles["record-detail-content"]}>
        <section className={styles["record-summary"]} aria-label="기록 일시">
          <time dateTime={record.recorded_at}>{dateLabel}</time>
          <strong>{formatRecordTime(record.recorded_at)}</strong>
        </section>

        <section className={styles["detail-list"]} aria-label="기록 내용">
          {detailItems.map((item) => (
            <div className={styles["detail-item"]} key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </section>
        {deleteErrorMessage && <p className={styles["error-message"]}>{deleteErrorMessage}</p>}
      </div>

      <div className={styles["fixed-actions"]}>
        <Button
          color="gray"
          fill="outline"
          isDisabled={!editHref}
          isFullWidth
          onClick={() => editHref && router.push(editHref)}
          size="large"
        >
          수정
        </Button>
        <Button color="danger" isFullWidth onClick={() => setIsDeleteModalOpen(true)} size="large">
          삭제
        </Button>
      </div>

      <ConfirmModal
        cancelButton={{ label: "취소", onClick: () => setIsDeleteModalOpen(false) }}
        confirmButton={{ color: "danger", isLoading: isDeleting, label: "삭제", onClick: () => void handleDelete() }}
        isOpen={isDeleteModalOpen}
        message="삭제한 기록은 되돌릴 수 없습니다."
        onClose={() => setIsDeleteModalOpen(false)}
        title="이 기록을 삭제할까요?"
      />
    </main>
  );
}
