import TextInput from "@/components/common/form/TextInput";

import type { TFoodFormItem } from "@/app/(app)/record/food/_type/foodForm";

import { MdAdd, MdClose } from "react-icons/md";

import styles from "./foodItemsField.module.scss";

export default function FoodItemsField(props: {
  foods: TFoodFormItem[];
  onChange: (foods: TFoodFormItem[]) => void;
}) {
  const { foods, onChange } = props;

  function handleAddFood() {
    onChange([
      ...foods,
      {
        id: getNextFoodItemId(foods),
        name: "",
        amount: "",
      },
    ]);
  }

  function handleChangeFood(
    id: number,
    key: "name" | "amount",
    value: string,
  ) {
    onChange(
      foods.map((food) =>
        food.id === id ? { ...food, [key]: value } : food,
      ),
    );
  }

  function handleRemoveFood(id: number) {
    onChange(foods.filter((food) => food.id !== id));
  }

  return (
    <div className={styles["food-items-field"]}>
      {foods.map((food, index) => (
        <div className={styles["food-item"]} key={food.id}>
          <div className={styles["food-action-slot"]}>
            {index === foods.length - 1 && (
              <button
                aria-label="먹은 것 추가"
                className={`${styles["food-action-button"]} ${styles["add-food-button"]}`}
                onClick={handleAddFood}
                title="먹은 것 추가"
                type="button"
              >
                <MdAdd aria-hidden="true" />
              </button>
            )}
          </div>

          <label
            className={styles["sr-only"]}
            htmlFor={`food-name-${food.id}`}
          >
            먹은 것 이름
          </label>
          <TextInput
            id={`food-name-${food.id}`}
            onChange={(value) => handleChangeFood(food.id, "name", value)}
            placeholder="먹은 것"
            value={food.name}
          />

          <label
            className={styles["sr-only"]}
            htmlFor={`food-amount-${food.id}`}
          >
            양
          </label>
          <TextInput
            id={`food-amount-${food.id}`}
            onChange={(value) => handleChangeFood(food.id, "amount", value)}
            placeholder="양"
            value={food.amount}
          />

          <div className={styles["food-action-slot"]}>
            {foods.length > 1 && (
              <button
                aria-label="먹은 것 삭제"
                className={`${styles["food-action-button"]} ${styles["remove-food-button"]}`}
                onClick={() => handleRemoveFood(food.id)}
                title="먹은 것 삭제"
                type="button"
              >
                <MdClose aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getNextFoodItemId(foods: TFoodFormItem[]) {
  return foods.reduce((maxId, food) => Math.max(maxId, food.id), 0) + 1;
}
