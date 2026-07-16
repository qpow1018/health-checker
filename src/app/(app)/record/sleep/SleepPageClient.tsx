"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCreateSleepRecord, useHealthRecord, useUpdateHealthRecord } from "@/queries/healthRecordsQuery";
import { formatDateString, getTodayDateString } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import TimePicker from "@/components/common/form/TimePicker";

import styles from "./sleepPageClient.module.scss";

export default function SleepPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [sleptOn, setSleptOn] = useState(getTodayDateString);
  const [sleptAt, setSleptAt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: createSleepRecord, isPending: isSaving } = useCreateSleepRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } = useUpdateHealthRecord();
  const { data: record } = useHealthRecord(editId ?? "");

  useEffect(() => {
    if (!record || record.category !== "sleep") {
      return;
    }

    const date = new Date(record.recorded_at);
    setSleptOn(formatDateString(date));
    setSleptAt(formatTimeString(date));
  }, [record]);

  async function handleSubmit() {
    if (!sleptOn || !sleptAt) {
      return;
    }

    setErrorMessage("");

    try {
      if (editId) {
        await updateHealthRecord({ id: editId, date: sleptOn, time: sleptAt, details: { event: "slept" } });
        router.replace(`/records/${editId}`);
        return;
      }

      await createSleepRecord({ date: sleptOn, time: sleptAt, event: "slept" });
      router.back();
    } catch {
      setErrorMessage("잠든 시간을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main
      className={styles["sleep-page-client"]}
      aria-label="잠든 시간 기록 화면"
    >
      <AppHeader title="잠든 시간" />

      <div className={styles["sleep-page-content"]}>
        <form
          className={styles["sleep-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormRow label="날짜" htmlFor="slept-on">
            <DatePicker id="slept-on" onChange={setSleptOn} value={sleptOn} />
          </FormRow>
          <FormRow label="시간" htmlFor="slept-at">
            <TimePicker id="slept-at" onChange={setSleptAt} value={sleptAt} />
          </FormRow>

          <Button
            color="primary"
            isDisabled={!sleptOn || !sleptAt}
            isFullWidth
            isLoading={isSaving || isUpdating}
            size="large"
            type="submit"
          >
            {editId ? "수정 완료" : "저장"}
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

function formatTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
