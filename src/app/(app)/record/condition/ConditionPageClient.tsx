"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCreateConditionRecord, useHealthRecord, useUpdateHealthRecord } from "@/queries/healthRecordsQuery";
import { formatDateString, getCurrentTimeString, getTodayDateString } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import Textarea from "@/components/common/form/Textarea";
import TimePicker from "@/components/common/form/TimePicker";

import styles from "./conditionPageClient.module.scss";

export default function ConditionPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [recordedOn, setRecordedOn] = useState(getTodayDateString);
  const [recordedAt, setRecordedAt] = useState(getCurrentTimeString);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: createConditionRecord, isPending: isSaving } = useCreateConditionRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } = useUpdateHealthRecord();
  const { data: record } = useHealthRecord(editId ?? "");

  useEffect(() => {
    if (!record || record.category !== "condition" || !isRecord(record.details)) return;

    const date = new Date(record.recorded_at);
    setRecordedOn(formatDateString(date));
    setRecordedAt(formatTimeString(date));
    setNote(typeof record.details.note === "string" ? record.details.note : "");
  }, [record]);

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
        router.replace(`/records/${editId}`);
        return;
      }

      await createConditionRecord(variables);
      router.back();
    } catch {
      setErrorMessage("컨디션 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main className={styles["condition-page-client"]} aria-label="컨디션 기록 화면">
      <AppHeader title="컨디션" />

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
            {editId ? "수정 완료" : "저장"}
          </Button>
          {errorMessage && <FormMessage type="error">{errorMessage}</FormMessage>}
        </form>
      </div>

      <BottomNavigation />
    </main>
  );
}

function formatTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
