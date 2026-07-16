"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCreateFoodRecord } from "@/queries/healthRecordsQuery";
import { getTodayDateString } from "@/utils/date";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormMessage from "@/components/common/form/FormMessage";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";
import TimePicker from "@/components/common/form/TimePicker";

import { MdClose } from "react-icons/md";

import styles from "./foodPageClient.module.scss";

type TFoodFormItem = {
  id: number;
  name: string;
  amount: string;
};

let nextFoodItemId = 0;

export default function FoodPageClient() {
  const router = useRouter();

  const [recordedOn, setRecordedOn] = useState(getTodayDateString);
  const [recordedAt, setRecordedAt] = useState("");
  const [foods, setFoods] = useState<TFoodFormItem[]>(() => [createFoodFormItem()]);
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: createFoodRecord, isPending: isSaving } = useCreateFoodRecord();
  const hasFood = foods.some((food) => food.name.trim());

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

  async function handleSubmit() {
    if (!recordedOn || !recordedAt || !hasFood) {
      return;
    }

    setErrorMessage("");

    try {
      await createFoodRecord({
        date: recordedOn,
        time: recordedAt,
        foods: foods.map(({ name, amount }) => ({ name, amount })),
      });
      router.back();
    } catch {
      setErrorMessage("음식 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main className={styles["food-page-client"]} aria-label="음식 기록 화면">
      <AppHeader title="먹은 음식" />

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
          <FormRow label="음식">
            <div className={styles["food-items"]}>
              {foods.map((food) => (
                <div className={styles["food-item"]} key={food.id}>
                  <label className={styles["sr-only"]} htmlFor={`food-name-${food.id}`}>
                    음식 이름
                  </label>
                  <TextInput
                    id={`food-name-${food.id}`}
                    onChange={(value) => handleChangeFood(food.id, "name", value)}
                    placeholder="음식 이름"
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
                      aria-label="음식 삭제"
                      className={styles["remove-food-button"]}
                      onClick={() => handleRemoveFood(food.id)}
                      title="음식 삭제"
                      type="button"
                    >
                      <MdClose aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              <Button color="gray" fill="outline" onClick={handleAddFood} size="medium" type="button">
                음식 추가
              </Button>
            </div>
          </FormRow>

          <Button
            color="primary"
            isDisabled={!recordedOn || !recordedAt || !hasFood}
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

function createFoodFormItem(): TFoodFormItem {
  nextFoodItemId += 1;

  return {
    id: nextFoodItemId,
    name: "",
    amount: "",
  };
}
