"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCreateConditionRecord, useHealthRecord, useUpdateHealthRecord } from "@/queries/healthRecordsQuery";
import { formatDateString, getCurrentRecordDateTime } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import Textarea from "@/components/common/form/Textarea";
import TimePicker from "@/components/common/form/TimePicker";
import BoxLoading from "@/components/common/loading/BoxLoading";

import styles from "./conditionPageClient.module.scss";

export default function ConditionPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [defaultRecordDateTime] = useState(getCurrentRecordDateTime);
  const [recordedOn, setRecordedOn] = useState(defaultRecordDateTime.date);
  const [recordedAt, setRecordedAt] = useState(defaultRecordDateTime.time);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditFormReady, setIsEditFormReady] = useState(!isEditing);
  const { mutateAsync: createConditionRecord, isPending: isSaving } = useCreateConditionRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } = useUpdateHealthRecord();
  const { data: record, isLoading: isLoadingRecord, isError: isRecordError } = useHealthRecord(editId ?? "");

  useEffect(() => {
    if (!isEditing || !record || record.category !== "condition" || !isRecord(record.details)) return;

    const date = new Date(record.recorded_at);
    setRecordedOn(formatDateString(date));
    setRecordedAt(formatTimeString(date));
    setNote(typeof record.details.note === "string" ? record.details.note : "");
    setIsEditFormReady(true);
  }, [isEditing, record]);

  if (isEditing && isLoadingRecord) {
    return (
      <main className={styles["condition-page-client"]} aria-label="컨디션 기록 수정 화면">
        <AppHeader title="컨디션 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  if (isEditing && (isRecordError || !record || record.category !== "condition")) {
    return (
      <main className={styles["condition-page-client"]} aria-label="컨디션 기록 수정 화면">
        <AppHeader title="컨디션 기록 수정" />
        <p className={styles["notice-message"]}>수정할 기록을 찾을 수 없습니다.</p>
      </main>
    );
  }

  if (isEditing && !isEditFormReady) {
    return (
      <main className={styles["condition-page-client"]} aria-label="컨디션 기록 수정 화면">
        <AppHeader title="컨디션 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !note.trim()) {
      return;
    }

    setErrorMessage("");

    try {
      const variables = {
        date: recordedOn,
        time: recordedAt,
        note,
      };

      if (editId) {
        await updateHealthRecord({ id: editId, ...variables, details: { note: note.trim() } });
        router.back();
        return;
      }

      await createConditionRecord(variables);
      router.back();
    } catch {
      setErrorMessage(isEditing ? "컨디션 기록을 수정하지 못했습니다. 다시 시도해 주세요." : "컨디션 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main className={styles["condition-page-client"]} aria-label={isEditing ? "컨디션 기록 수정 화면" : "컨디션 기록 화면"}>
      <AppHeader title={isEditing ? "컨디션 기록 수정" : "컨디션"} />

      <div className={styles["condition-page-content"]}>
        <form
          className={styles["condition-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormRow label="날짜" htmlFor="condition-recorded-on">
            <DatePicker id="condition-recorded-on" onChange={setRecordedOn} value={recordedOn} />
          </FormRow>
          <FormRow label="시간" htmlFor="condition-recorded-at">
            <TimePicker id="condition-recorded-at" onChange={setRecordedAt} value={recordedAt} />
          </FormRow>
          <FormRow label="불편했던 점" htmlFor="condition-note">
            <Textarea
              id="condition-note"
              onChange={setNote}
              placeholder="두통, 속이 불편함, 피곤함"
              value={note}
            />
          </FormRow>

          <Button
            color="primary"
            isDisabled={!recordedOn || !recordedAt || !note.trim()}
            isFullWidth
            isLoading={isSaving || isUpdating}
            size="large"
            type="submit"
          >
            {isEditing ? "수정 완료" : "저장"}
          </Button>
          {errorMessage && <FormMessage type="error">{errorMessage}</FormMessage>}
        </form>
      </div>

      {!isEditing && <BottomNavigation />}
    </main>
  );
}

function formatTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
