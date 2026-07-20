"use client";

import { useSearchParams } from "next/navigation";

import { useHealthRecord } from "@/queries/healthRecordsQuery";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import BoxLoading from "@/components/common/loading/BoxLoading";

import {
  createEmptyFoodFormValue,
  getFoodRecordFormValue,
} from "@/app/(app)/record/food/_util/foodForm";

import FoodRecordForm from "./_component/FoodRecordForm";
import styles from "./foodPageClient.module.scss";

export default function FoodPageClient() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);
  const {
    data: record,
    isLoading: isLoadingRecord,
    isError: isRecordError,
  } = useHealthRecord(editId ?? "");
  const editFormValue = record ? getFoodRecordFormValue(record) : null;

  if (isEditing && isLoadingRecord) {
    return (
      <main
        className={styles["food-page-client"]}
        aria-label="먹은 것 기록 수정 화면"
      >
        <AppHeader title="먹은 것 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  if (isEditing && (isRecordError || !editFormValue)) {
    return (
      <main
        className={styles["food-page-client"]}
        aria-label="먹은 것 기록 수정 화면"
      >
        <AppHeader title="먹은 것 기록 수정" />
        <p className={styles["notice-message"]}>
          수정할 기록을 찾을 수 없습니다.
        </p>
      </main>
    );
  }

  const initialValue = editFormValue ?? createEmptyFoodFormValue();

  return (
    <main
      className={styles["food-page-client"]}
      aria-label={isEditing ? "먹은 것 기록 수정 화면" : "먹은 것 기록 화면"}
    >
      <AppHeader title={isEditing ? "먹은 것 기록 수정" : "먹은 것 기록"} />

      <div className={styles["food-page-content"]}>
        <FoodRecordForm
          editId={editId ?? undefined}
          initialValue={initialValue}
          key={editId ?? "create"}
        />
      </div>

      {!isEditing && <BottomNavigation />}
    </main>
  );
}
