"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSleepRecord } from "@/api/healthRecords";
import { getTodayDateString } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import TimePicker from "@/components/common/form/TimePicker";

import styles from "./wakePageClient.module.scss";

export default function WakePageClient() {
  const router = useRouter();

  const [wokeOn, setWokeOn] = useState(getTodayDateString);
  const [wokeAt, setWokeAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!wokeOn || !wokeAt) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await createSleepRecord({ date: wokeOn, time: wokeAt, event: "woke" });
      router.back();
    } catch {
      setErrorMessage("기상 시간을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles["wake-page-client"]} aria-label="기상 시간 기록 화면">
      <AppHeader title="기상 시간" />

      <div className={styles["wake-page-content"]}>
        <form
          className={styles["wake-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormRow label="날짜" htmlFor="woke-on">
            <DatePicker id="woke-on" onChange={setWokeOn} value={wokeOn} />
          </FormRow>
          <FormRow label="시간" htmlFor="woke-at">
            <TimePicker id="woke-at" onChange={setWokeAt} value={wokeAt} />
          </FormRow>

          <Button
            color="primary"
            isDisabled={!wokeOn || !wokeAt}
            isFullWidth
            isLoading={isSaving}
            size="large"
            type="submit"
          >
            저장
          </Button>
          {errorMessage && (
            <FormMessage type="error">{errorMessage}</FormMessage>
          )}
        </form>
      </div>

      <BottomNavigation />
    </main>
  );
}
