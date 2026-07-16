"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCreateToiletRecord, useHealthRecord, useUpdateHealthRecord } from "@/queries/healthRecordsQuery";
import type {
  TToiletDetailsV1,
  TToiletStoolConsistency,
  TToiletType,
  TToiletUrgency,
} from "@/api/healthRecords/type";
import { formatDateString, getTodayDateString } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import ButtonGroup from "@/components/common/buttonGroup/ButtonGroup";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import Textarea from "@/components/common/form/Textarea";
import TimePicker from "@/components/common/form/TimePicker";

import styles from "./toiletPageClient.module.scss";

const TOILET_TYPE_OPTIONS = [
  { value: "urine", label: "소변" },
  { value: "bowel", label: "대변" },
  { value: "both", label: "둘 다" },
] as const;

const URGENCY_OPTIONS = [
  { value: "", label: "기록 안 함" },
  { value: "relaxed", label: "여유" },
  { value: "ordinary", label: "보통" },
  { value: "urgent", label: "급함" },
] as const;

const WOKE_FROM_SLEEP_OPTIONS = [
  { value: "", label: "기록 안 함" },
  { value: "yes", label: "예" },
  { value: "no", label: "아니오" },
] as const;

const STOOL_CONSISTENCY_OPTIONS = [
  { value: "", label: "기록 안 함" },
  { value: "hard", label: "단단함" },
  { value: "formed", label: "형태 있음" },
  { value: "loose", label: "묽음" },
  { value: "watery", label: "물처럼 묽음" },
] as const;

export default function ToiletPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [recordedOn, setRecordedOn] = useState(getTodayDateString);
  const [recordedAt, setRecordedAt] = useState("");
  const [type, setType] = useState<TToiletType | "">("");
  const [urgency, setUrgency] = useState<TToiletUrgency | "">("");
  const [wokeFromSleep, setWokeFromSleep] = useState<"" | "yes" | "no">("");
  const [stoolConsistency, setStoolConsistency] = useState<TToiletStoolConsistency | "">("");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: createToiletRecord, isPending: isSaving } = useCreateToiletRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } = useUpdateHealthRecord();
  const { data: record } = useHealthRecord(editId ?? "");
  const canRecordStoolConsistency = type === "bowel" || type === "both";

  useEffect(() => {
    if (!record || record.category !== "toilet" || !isRecord(record.details)) return;

    const date = new Date(record.recorded_at);
    setRecordedOn(formatDateString(date));
    setRecordedAt(formatTimeString(date));
    setType(isToiletType(record.details.type) ? record.details.type : "");
    setUrgency(isUrgency(record.details.urgency) ? record.details.urgency : "");
    setWokeFromSleep(
      typeof record.details.wokeFromSleep === "boolean" ? (record.details.wokeFromSleep ? "yes" : "no") : "",
    );
    setStoolConsistency(isStoolConsistency(record.details.stoolConsistency) ? record.details.stoolConsistency : "");
    setNote(typeof record.details.note === "string" ? record.details.note : "");
  }, [record]);

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !type) {
      return;
    }

    setErrorMessage("");

    try {
      const details = createToiletDetails({
        type,
        urgency,
        wokeFromSleep,
        stoolConsistency,
        note,
      });

      if (editId) {
        await updateHealthRecord({ id: editId, date: recordedOn, time: recordedAt, details });
        router.replace(`/records/${editId}`);
        return;
      }

      await createToiletRecord({
        date: recordedOn,
        time: recordedAt,
        details,
      });
      router.back();
    } catch {
      setErrorMessage("화장실 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main className={styles["toilet-page-client"]} aria-label="화장실 기록 화면">
      <AppHeader title="화장실" />

      <div className={styles["toilet-page-content"]}>
        <form
          className={styles["toilet-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormRow label="날짜" htmlFor="toilet-recorded-on">
            <DatePicker id="toilet-recorded-on" onChange={setRecordedOn} value={recordedOn} />
          </FormRow>
          <FormRow label="시간" htmlFor="toilet-recorded-at">
            <TimePicker id="toilet-recorded-at" onChange={setRecordedAt} value={recordedAt} />
          </FormRow>
          <FormRow label="종류">
            <ButtonGroup
              label="종류"
              onChange={(value) => setType(value as TToiletType)}
              options={TOILET_TYPE_OPTIONS}
              value={type}
            />
          </FormRow>
          <FormRow label="급한 정도 (선택)">
            <ButtonGroup
              label="급한 정도"
              onChange={(value) => setUrgency(value as TToiletUrgency | "")}
              options={URGENCY_OPTIONS}
              value={urgency}
            />
          </FormRow>
          <FormRow label="잠에서 깬 뒤인지 (선택)">
            <ButtonGroup
              label="잠에서 깬 뒤인지"
              onChange={(value) => setWokeFromSleep(value as "" | "yes" | "no")}
              options={WOKE_FROM_SLEEP_OPTIONS}
              value={wokeFromSleep}
            />
          </FormRow>
          {canRecordStoolConsistency && (
            <FormRow label="대변 상태 (선택)">
              <ButtonGroup
                label="대변 상태"
                onChange={(value) => setStoolConsistency(value as TToiletStoolConsistency | "")}
                options={STOOL_CONSISTENCY_OPTIONS}
                value={stoolConsistency}
              />
            </FormRow>
          )}
          <FormRow label="특이사항 (선택)" htmlFor="toilet-note">
            <Textarea
              id="toilet-note"
              onChange={setNote}
              placeholder="통증이나 평소와 다른 변화가 있었다면 짧게 남겨주세요."
              value={note}
            />
          </FormRow>

          <Button
            color="primary"
            isDisabled={!recordedOn || !recordedAt || !type}
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

function isToiletType(value: unknown): value is TToiletType {
  return value === "urine" || value === "bowel" || value === "both";
}

function isUrgency(value: unknown): value is TToiletUrgency {
  return value === "relaxed" || value === "ordinary" || value === "urgent";
}

function isStoolConsistency(value: unknown): value is TToiletStoolConsistency {
  return value === "hard" || value === "formed" || value === "loose" || value === "watery";
}

function createToiletDetails(props: {
  type: TToiletType;
  urgency: TToiletUrgency | "";
  wokeFromSleep: "" | "yes" | "no";
  stoolConsistency: TToiletStoolConsistency | "";
  note: string;
}): TToiletDetailsV1 {
  const { type, urgency, wokeFromSleep, stoolConsistency, note } = props;
  const commonDetails = {
    ...(urgency && { urgency }),
    ...(wokeFromSleep && { wokeFromSleep: wokeFromSleep === "yes" }),
    ...(note.trim() && { note: note.trim() }),
  };

  if (type === "urine") {
    return { type, ...commonDetails };
  }

  return {
    type,
    ...commonDetails,
    ...(stoolConsistency && { stoolConsistency }),
  };
}
