"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  useCreateExerciseRecord,
  useHealthRecord,
  useUpdateHealthRecord,
} from "@/queries/healthRecordsQuery";
import { formatDateString, getCurrentRecordDateTime } from "@/utils/date";
import toast from "@/utils/toast";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";
import TimePicker from "@/components/common/form/TimePicker";
import BoxLoading from "@/components/common/loading/BoxLoading";

import { MdClose } from "react-icons/md";

import styles from "./exercisePageClient.module.scss";

type TExerciseFormItem = {
  id: number;
  name: string;
  amount: string;
};

let nextExerciseItemId = 0;

export default function ExercisePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [defaultRecordDateTime] = useState(getCurrentRecordDateTime);
  const [recordedOn, setRecordedOn] = useState(defaultRecordDateTime.date);
  const [recordedAt, setRecordedAt] = useState(defaultRecordDateTime.time);
  const [exercises, setExercises] = useState<TExerciseFormItem[]>(() => [
    createExerciseFormItem(),
  ]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditFormReady, setIsEditFormReady] = useState(!isEditing);
  const { mutateAsync: createExerciseRecord, isPending: isSaving } =
    useCreateExerciseRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } =
    useUpdateHealthRecord();
  const {
    data: record,
    isLoading: isLoadingRecord,
    isError: isRecordError,
  } = useHealthRecord(editId ?? "");
  const hasExercise = exercises.some((exercise) => exercise.name.trim());

  useEffect(() => {
    if (
      !isEditing ||
      !record ||
      record.category !== "exercise" ||
      !isRecord(record.details) ||
      !Array.isArray(record.details.exercises)
    ) {
      return;
    }

    const date = new Date(record.recorded_at);
    const recordExercises = record.details.exercises.flatMap((exercise) => {
      if (!isRecord(exercise) || typeof exercise.name !== "string") {
        return [];
      }

      return [
        {
          id: (nextExerciseItemId += 1),
          name: exercise.name,
          amount: typeof exercise.amount === "string" ? exercise.amount : "",
        },
      ];
    });

    setRecordedOn(formatDateString(date));
    setRecordedAt(formatTimeString(date));
    setExercises(
      recordExercises.length > 0 ? recordExercises : [createExerciseFormItem()],
    );
    setIsEditFormReady(true);
  }, [isEditing, record]);

  if (isEditing && isLoadingRecord) {
    return (
      <main
        className={styles["exercise-page-client"]}
        aria-label="운동 기록 수정 화면"
      >
        <AppHeader title="운동 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  if (isEditing && (isRecordError || !record || record.category !== "exercise")) {
    return (
      <main
        className={styles["exercise-page-client"]}
        aria-label="운동 기록 수정 화면"
      >
        <AppHeader title="운동 기록 수정" />
        <p className={styles["notice-message"]}>수정할 기록을 찾을 수 없습니다.</p>
      </main>
    );
  }

  if (isEditing && !isEditFormReady) {
    return (
      <main
        className={styles["exercise-page-client"]}
        aria-label="운동 기록 수정 화면"
      >
        <AppHeader title="운동 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  function handleAddExercise() {
    setExercises((currentExercises) => [
      ...currentExercises,
      createExerciseFormItem(),
    ]);
  }

  function handleChangeExercise(
    id: number,
    key: "name" | "amount",
    value: string,
  ) {
    setExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.id === id ? { ...exercise, [key]: value } : exercise,
      ),
    );
  }

  function handleRemoveExercise(id: number) {
    setExercises((currentExercises) =>
      currentExercises.filter((exercise) => exercise.id !== id),
    );
  }

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !hasExercise) {
      return;
    }

    setErrorMessage("");

    try {
      const exerciseValues = exercises.map(({ name, amount }) => ({ name, amount }));

      if (editId) {
        await updateHealthRecord({
          id: editId,
          date: recordedOn,
          time: recordedAt,
          details: {
            exercises: exerciseValues
              .filter((exercise) => exercise.name.trim())
              .map((exercise) => ({
                name: exercise.name.trim(),
                ...(exercise.amount.trim() && { amount: exercise.amount.trim() }),
              })),
          },
        });
        toast.success("기록을 수정했습니다.");
        router.back();
        return;
      }

      await createExerciseRecord({
        date: recordedOn,
        time: recordedAt,
        exercises: exerciseValues,
      });
      toast.success("기록을 저장했습니다.");
      router.back();
    } catch {
      setErrorMessage(
        isEditing
          ? "운동 기록을 수정하지 못했습니다. 다시 시도해 주세요."
          : "운동 기록을 저장하지 못했습니다. 다시 시도해 주세요.",
      );
    }
  }

  return (
    <main
      className={styles["exercise-page-client"]}
      aria-label={isEditing ? "운동 기록 수정 화면" : "운동 기록 화면"}
    >
      <AppHeader title={isEditing ? "운동 기록 수정" : "운동"} />

      <div className={styles["exercise-page-content"]}>
        <form
          className={styles["exercise-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormRow label="날짜" htmlFor="exercise-recorded-on">
            <DatePicker
              id="exercise-recorded-on"
              onChange={setRecordedOn}
              value={recordedOn}
            />
          </FormRow>
          <FormRow label="시간" htmlFor="exercise-recorded-at">
            <TimePicker
              id="exercise-recorded-at"
              onChange={setRecordedAt}
              value={recordedAt}
            />
          </FormRow>
          <FormRow label="운동">
            <div className={styles["exercise-items"]}>
              {exercises.map((exercise) => (
                <div className={styles["exercise-item"]} key={exercise.id}>
                  <label
                    className={styles["sr-only"]}
                    htmlFor={`exercise-name-${exercise.id}`}
                  >
                    운동 이름
                  </label>
                  <TextInput
                    id={`exercise-name-${exercise.id}`}
                    onChange={(value) =>
                      handleChangeExercise(exercise.id, "name", value)
                    }
                    placeholder="산책"
                    value={exercise.name}
                  />
                  <label
                    className={styles["sr-only"]}
                    htmlFor={`exercise-amount-${exercise.id}`}
                  >
                    운동량
                  </label>
                  <TextInput
                    id={`exercise-amount-${exercise.id}`}
                    onChange={(value) =>
                      handleChangeExercise(exercise.id, "amount", value)
                    }
                    placeholder="30분"
                    value={exercise.amount}
                  />
                  {exercises.length > 1 && (
                    <button
                      aria-label="운동 삭제"
                      className={styles["remove-exercise-button"]}
                      onClick={() => handleRemoveExercise(exercise.id)}
                      title="운동 삭제"
                      type="button"
                    >
                      <MdClose aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                color="gray"
                fill="outline"
                onClick={handleAddExercise}
                size="medium"
                type="button"
              >
                운동 추가
              </Button>
            </div>
          </FormRow>

          <Button
            color="primary"
            isDisabled={!recordedOn || !recordedAt || !hasExercise}
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

function createExerciseFormItem(): TExerciseFormItem {
  nextExerciseItemId += 1;

  return {
    id: nextExerciseItemId,
    name: "",
    amount: "",
  };
}

function formatTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
