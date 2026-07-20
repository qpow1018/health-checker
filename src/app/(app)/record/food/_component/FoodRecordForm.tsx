import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  useCreateFoodRecord,
  useUpdateHealthRecord,
} from "@/queries/healthRecordsQuery";
import toast from "@/utils/toast";

import Button from "@/components/common/button/Button";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";
import DatePicker from "@/components/common/form/DatePicker";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";
import TimePicker from "@/components/common/form/TimePicker";

import type { TFoodRecommendation } from "@/api/foodRecommendations/type";
import type { TFoodFormValue } from "@/app/(app)/record/food/_type/foodForm";
import { createFoodFormItem } from "@/app/(app)/record/food/_util/foodForm";

import FoodItemsField from "./FoodItemsField";
import FoodRecommendationPicker from "./FoodRecommendationPicker";
import styles from "./foodRecordForm.module.scss";

export default function FoodRecordForm(props: {
  editId?: string;
  initialValue: TFoodFormValue;
}) {
  const { editId, initialValue } = props;
  const isEditing = Boolean(editId);
  const router = useRouter();

  const [recordedOn, setRecordedOn] = useState(initialValue.recordedOn);
  const [recordedAt, setRecordedAt] = useState(initialValue.recordedAt);
  const [source, setSource] = useState(initialValue.source);
  const [foods, setFoods] = useState(initialValue.foods);
  const [pendingRecommendation, setPendingRecommendation] =
    useState<TFoodRecommendation | null>(null);
  const { mutateAsync: createFoodRecord, isPending: isSaving } =
    useCreateFoodRecord();
  const { mutateAsync: updateHealthRecord, isPending: isUpdating } =
    useUpdateHealthRecord();
  const hasFood = foods.some((food) => food.name.trim());

  function handleSelectRecommendation(recommendation: TFoodRecommendation) {
    const hasCurrentInput =
      Boolean(source.trim()) ||
      foods.some((food) => food.name.trim() || food.amount.trim());

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
    setFoods(
      recommendation.foods.map((food, index) =>
        createFoodFormItem(food, index + 1),
      ),
    );
  }

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !hasFood) {
      return;
    }

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
            foods: foodValues
              .filter((food) => food.name.trim())
              .map((food) => ({
                name: food.name.trim(),
                ...(food.amount.trim() && { amount: food.amount.trim() }),
              })),
          },
        });
        toast.success("기록을 수정했습니다.");
        router.back();
        return;
      }

      await createFoodRecord({
        date: recordedOn,
        time: recordedAt,
        source,
        foods: foodValues,
      });
      toast.success("기록을 저장했습니다.");
      router.back();
    } catch {
      toast.error(
        isEditing
          ? "먹은 것 기록을 수정하지 못했습니다. 다시 시도해 주세요."
          : "먹은 것 기록을 저장하지 못했습니다. 다시 시도해 주세요.",
      );
    }
  }

  return (
    <>
      <form
        className={styles["food-record-form"]}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <FormRow label="날짜" htmlFor="food-recorded-on">
          <DatePicker
            id="food-recorded-on"
            onChange={setRecordedOn}
            value={recordedOn}
          />
        </FormRow>

        <FormRow label="시간" htmlFor="food-recorded-at">
          <TimePicker
            id="food-recorded-at"
            onChange={setRecordedAt}
            value={recordedAt}
          />
        </FormRow>

        <FormRow label="이전 기록 불러오기">
          <FoodRecommendationPicker
            id="food-recommendation-search"
            onSelect={handleSelectRecommendation}
          />
        </FormRow>

        <FormRow label="가게·브랜드" htmlFor="food-source">
          <TextInput
            id="food-source"
            onChange={setSource}
            placeholder="가게·브랜드"
            value={source}
          />
        </FormRow>

        <FormRow label="먹은 것">
          <FoodItemsField foods={foods} onChange={setFoods} />
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
      </form>

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
    </>
  );
}
