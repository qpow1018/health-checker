"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createConditionRecord } from "@/api/healthRecords";
import { getCurrentTimeString, getTodayDateString } from "@/utils/date";

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

  const [recordedOn, setRecordedOn] = useState(getTodayDateString);
  const [recordedAt, setRecordedAt] = useState(getCurrentTimeString);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !note.trim()) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await createConditionRecord({
        date: recordedOn,
        time: recordedAt,
        note,
      });
      router.back();
    } catch {
      setErrorMessage("컨디션 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
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
            isLoading={isSaving}
            size="large"
            type="submit"
          >
            저장
          </Button>
          {errorMessage && <FormMessage type="error">{errorMessage}</FormMessage>}
        </form>
      </div>

      <BottomNavigation />
    </main>
  );
}
