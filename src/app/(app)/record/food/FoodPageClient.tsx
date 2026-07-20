"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCreateFoodRecord, useHealthRecord, useUpdateHealthRecord } from "@/queries/healthRecordsQuery";
import { formatDateString, getCurrentRecordDateTime } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";
import TimePicker from "@/components/common/form/TimePicker";
import BoxLoading from "@/components/common/loading/BoxLoading";

import type { TFoodRecommendation } from "@/api/foodRecommendations/type";

import { MdClose } from "react-icons/md";

import FoodRecommendationPicker from "./_component/FoodRecommendationPicker";
import styles from "./foodPageClient.module.scss";

type TFoodFormItem = {
  id: number;
  name: string;
  amount: string;
};

let nextFoodItemId = 0;

export default function FoodPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [defaultRecordDateTime] = useState(getCurrentRecordDateTime);
  const [recordedOn, setRecordedOn] = useState(defaultRecordDateTime.date);
  const [recordedAt, setRecordedAt] = useState(defaultRecordDateTime.time);
  const [source, setSource] = useState("");
  const [foods, setFoods] = useState<TFoodFormItem[]>(() => [createFoodFormItem()]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditFormReady, setIsEditFormReady] = useState(!isEditing);
  const [pendingRecommendation, setPendingRecommendation] =
    useState<TFoodRecommendation | null>(null);
  const { mutateAsync: createFoodRecord, isPending: isSaving } = useCreateFoodRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } = useUpdateHealthRecord();
  const { data: record, isLoading: isLoadingRecord, isError: isRecordError } = useHealthRecord(editId ?? "");
  const hasFood = foods.some((food) => food.name.trim());

  useEffect(() => {
    if (
      !isEditing ||
      !record ||
      record.category !== "food" ||
      !isRecord(record.details) ||
      !Array.isArray(record.details.foods)
    ) {
      return;
    }

    const date = new Date(record.recorded_at);
    const recordFoods = record.details.foods.flatMap((food) => {
      if (!isRecord(food) || typeof food.name !== "string") return [];

      return [{ id: nextFoodItemId += 1, name: food.name, amount: typeof food.amount === "string" ? food.amount : "" }];
    });

    setRecordedOn(formatDateString(date));
    setRecordedAt(formatTimeString(date));
    setSource(typeof record.details.source === "string" ? record.details.source : "");
    setFoods(recordFoods.length > 0 ? recordFoods : [createFoodFormItem()]);
    setIsEditFormReady(true);
  }, [isEditing, record]);

  if (isEditing && isLoadingRecord) {
    return (
      <main className={styles["food-page-client"]} aria-label="먹은 것 기록 수정 화면">
        <AppHeader title="먹은 것 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  if (isEditing && (isRecordError || !record || record.category !== "food")) {
    return (
      <main className={styles["food-page-client"]} aria-label="먹은 것 기록 수정 화면">
        <AppHeader title="먹은 것 기록 수정" />
        <p className={styles["notice-message"]}>수정할 기록을 찾을 수 없습니다.</p>
      </main>
    );
  }

  if (isEditing && !isEditFormReady) {
    return (
      <main className={styles["food-page-client"]} aria-label="먹은 것 기록 수정 화면">
        <AppHeader title="먹은 것 기록 수정" />
        <BoxLoading />
      </main>
    );
  }

  function handleAddFood() {
    setFoods((currentFoods) => [...currentFoods, createFoodFormItem()]);
  }

  function handleChangeFood(id: number, key: "name" | "amount", value: string) {
    setFoods((currentFoods) =>
      currentFoods.map((food) => (food.id === id ? { ...food, [key]: value } : food)),
    );
  }

  function handleRemoveFood(id: number) {
    setFoods((currentFoods) => currentFoods.filter((food) => food.id !== id));
  }

  function handleSelectRecommendation(recommendation: TFoodRecommendation) {
    const hasCurrentInput = Boolean(source.trim())
      || foods.some((food) => food.name.trim() || food.amount.trim());

    if (hasCurrentInput) {
      setPendingRecommendation(recommendation);
      return;
    }

    applyRecommendation(recommendation);
  }

  function handleCloseRecommendationConfirm() {
    setPendingRecommendation(null);
  }

  function handleConfirmRecommendation() {
    if (!pendingRecommendation) {
      return;
    }

    applyRecommendation(pendingRecommendation);
    setPendingRecommendation(null);
  }

  function applyRecommendation(recommendation: TFoodRecommendation) {
    setSource(recommendation.source ?? "");
    setFoods(recommendation.foods.map((food) => createFoodFormItem(food)));
  }

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !hasFood) {
      return;
    }

    setErrorMessage("");

    try {
      const foodValues = foods.map(({ name, amount }) => ({ name, amount }));

      if (editId) {
        const normalizedSource = source.trim();

        await updateHealthRecord({
          id: editId,
          date: recordedOn,
          time: recordedAt,
          details: {
            ...(normalizedSource && { source: normalizedSource }),
            foods: foodValues.filter((food) => food.name.trim()).map((food) => ({ name: food.name.trim(), ...(food.amount.trim() && { amount: food.amount.trim() }) })),
          },
        });
        router.back();
        return;
      }

      await createFoodRecord({
        date: recordedOn,
        time: recordedAt,
        source,
        foods: foodValues,
      });
      router.back();
    } catch {
      setErrorMessage(isEditing ? "먹은 것 기록을 수정하지 못했습니다. 다시 시도해 주세요." : "먹은 것 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main className={styles["food-page-client"]} aria-label={isEditing ? "먹은 것 기록 수정 화면" : "먹은 것 기록 화면"}>
      <AppHeader title={isEditing ? "먹은 것 기록 수정" : "먹은 것 기록"} />

      <div className={styles["food-page-content"]}>
        <form
          className={styles["food-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormRow label="날짜" htmlFor="food-recorded-on">
            <DatePicker id="food-recorded-on" onChange={setRecordedOn} value={recordedOn} />
          </FormRow>
          <FormRow label="시간" htmlFor="food-recorded-at">
            <TimePicker id="food-recorded-at" onChange={setRecordedAt} value={recordedAt} />
          </FormRow>
          <FormRow label="이전 기록 불러오기 (선택)" htmlFor="food-recommendation-search">
            <FoodRecommendationPicker
              id="food-recommendation-search"
              onSelect={handleSelectRecommendation}
            />
          </FormRow>
          <FormRow label="가게·브랜드 (선택)" htmlFor="food-source">
            <TextInput
              id="food-source"
              onChange={setSource}
              placeholder="예: 아딸, 맥도날드"
              value={source}
            />
          </FormRow>
          <FormRow label="먹은 것">
            <div className={styles["food-items"]}>
              {foods.map((food) => (
                <div className={styles["food-item"]} key={food.id}>
                  <label className={styles["sr-only"]} htmlFor={`food-name-${food.id}`}>
                    먹은 것 이름
                  </label>
                  <TextInput
                    id={`food-name-${food.id}`}
                    onChange={(value) => handleChangeFood(food.id, "name", value)}
                    placeholder="음식, 음료, 영양제"
                    value={food.name}
                  />
                  <label className={styles["sr-only"]} htmlFor={`food-amount-${food.id}`}>
                    양
                  </label>
                  <TextInput
                    id={`food-amount-${food.id}`}
                    onChange={(value) => handleChangeFood(food.id, "amount", value)}
                    placeholder="양"
                    value={food.amount}
                  />
                  {foods.length > 1 && (
                    <button
                      aria-label="먹은 것 삭제"
                      className={styles["remove-food-button"]}
                      onClick={() => handleRemoveFood(food.id)}
                      title="먹은 것 삭제"
                      type="button"
                    >
                      <MdClose aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              <Button color="gray" fill="outline" onClick={handleAddFood} size="medium" type="button">
                먹은 것 추가
              </Button>
            </div>
          </FormRow>

          <Button
            color="primary"
            isDisabled={!recordedOn || !recordedAt || !hasFood}
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

      <ConfirmModal
        isOpen={Boolean(pendingRecommendation)}
        title="추천 불러오기"
        message="현재 입력을 추천 내용으로 바꿀까요?"
        onClose={handleCloseRecommendationConfirm}
        cancelButton={{
          label: "취소",
          onClick: handleCloseRecommendationConfirm,
        }}
        confirmButton={{
          label: "바꾸기",
          color: "primary",
          onClick: handleConfirmRecommendation,
        }}
      />
    </main>
  );
}

function createFoodFormItem(food?: { name: string; amount?: string }): TFoodFormItem {
  nextFoodItemId += 1;

  return {
    id: nextFoodItemId,
    name: food?.name ?? "",
    amount: food?.amount ?? "",
  };
}

function formatTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
