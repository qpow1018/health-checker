"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  MdDeleteOutline,
  MdEdit,
  MdOutlineBookmarkAdd,
} from "react-icons/md";

import {
  useDeleteHealthRecord,
  useHealthRecord,
} from "@/queries/healthRecordsQuery";

import AppHeader from "@/components/common/appHeader/AppHeader";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";
import BoxLoading from "@/components/common/loading/BoxLoading";

import { isRecordCategoryFilter } from "@/app/(app)/records/_util/recordCategoryFilter";
import { isRecordMonthKey } from "@/app/(app)/records/_util/recordsMonth";
import toast from "@/utils/toast";
import AddRecordFavoriteModal from "./_component/AddRecordFavoriteModal";
import RecordDetailContent from "./_component/RecordDetailContent";
import { getRecordEditHref } from "./_util/recordDetailPresentation";

import styles from "./recordDetailPageClient.module.scss";

export default function RecordDetailPageClient({
  recordId,
}: {
  recordId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const { data: record, isLoading, isError } = useHealthRecord(recordId);
  const { mutateAsync: deleteHealthRecord, isPending: isDeleting } =
    useDeleteHealthRecord();

  async function handleDelete() {
    try {
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
      toast.success("기록을 삭제했습니다.");
      router.replace(query ? `/records?${query}` : "/records");
    } catch {
      toast.error("기록을 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  if (isLoading) {
    return (
      <RecordDetailPageLayout>
        <BoxLoading />
      </RecordDetailPageLayout>
    );
  }

  if (!record || isError) {
    return (
      <RecordDetailPageLayout>
        <p className={styles["notice-message"]}>기록을 찾을 수 없습니다.</p>
      </RecordDetailPageLayout>
    );
  }

  const editHref = getRecordEditHref(record, {
    category: searchParams.get("category"),
    month: searchParams.get("month"),
  });

  return (
    <RecordDetailPageLayout>
      <RecordDetailContent record={record} />

      <div
        aria-label="기록 작업"
        className={styles["fixed-actions"]}
        role="group"
      >
        <button
          aria-label="기록 삭제"
          className={`${styles["action-icon-button"]} ${styles["delete-action"]}`}
          onClick={() => setIsDeleteModalOpen(true)}
          type="button"
        >
          <MdDeleteOutline aria-hidden="true" />
        </button>
        <button
          aria-label="기록 수정"
          className={`${styles["action-icon-button"]} ${styles["edit-action"]}`}
          disabled={!editHref}
          onClick={() => editHref && router.push(editHref)}
          type="button"
        >
          <MdEdit aria-hidden="true" />
        </button>
        <button
          aria-label="즐겨찾기 추가"
          className={`${styles["action-icon-button"]} ${styles["favorite-action"]}`}
          onClick={() => setIsFavoriteModalOpen(true)}
          type="button"
        >
          <MdOutlineBookmarkAdd aria-hidden="true" />
        </button>
      </div>

      <AddRecordFavoriteModal
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        recordId={recordId}
      />

      <ConfirmModal
        cancelButton={{
          label: "취소",
          onClick: () => setIsDeleteModalOpen(false),
        }}
        confirmButton={{
          color: "danger",
          isLoading: isDeleting,
          label: "삭제",
          onClick: () => void handleDelete(),
        }}
        isOpen={isDeleteModalOpen}
        message="삭제한 기록은 되돌릴 수 없습니다."
        onClose={() => setIsDeleteModalOpen(false)}
        title="이 기록을 삭제할까요?"
      />
    </RecordDetailPageLayout>
  );
}

function RecordDetailPageLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className={styles["record-detail-page-client"]}
      aria-label="기록 상세 화면"
    >
      <AppHeader title="기록 상세" />
      {children}
    </main>
  );
}
