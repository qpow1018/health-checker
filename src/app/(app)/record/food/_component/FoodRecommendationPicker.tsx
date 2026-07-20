import { useEffect, useState, type FocusEvent } from "react";

import { useFoodRecommendations } from "@/queries/foodRecommendationsQuery";

import type { TFoodRecommendation } from "@/api/foodRecommendations/type";

import styles from "./foodRecommendationPicker.module.scss";

const SEARCH_DEBOUNCE_MS = 200;

export default function FoodRecommendationPicker(props: {
  id: string;
  onSelect: (recommendation: TFoodRecommendation) => void;
}) {
  const { id, onSelect } = props;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: recommendations = [], isError, isLoading } =
    useFoodRecommendations(debouncedSearch);
  const isSearchPending = search !== debouncedSearch;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsOpen(false);
  }

  function handleSelect(recommendation: TFoodRecommendation) {
    onSelect(recommendation);
    setSearch("");
    setDebouncedSearch("");
    setIsOpen(false);
  }

  return (
    <div className={styles["food-recommendation-picker"]} onBlurCapture={handleBlur}>
      <input
        autoComplete="off"
        id={id}
        onChange={(event) => {
          setSearch(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="가게 또는 음식 검색"
        type="search"
        value={search}
      />

      {isOpen ? (
        <div className={styles["recommendation-panel"]}>
          {isLoading || isSearchPending ? (
            <p className={styles["recommendation-notice"]}>추천을 불러오는 중...</p>
          ) : isError ? (
            <p className={styles["recommendation-notice"]} role="status">
              추천을 불러오지 못했습니다.
            </p>
          ) : recommendations.length === 0 ? (
            <p className={styles["recommendation-notice"]}>
              {debouncedSearch ? "일치하는 추천이 없습니다." : "저장된 추천이 없습니다."}
            </p>
          ) : (
            <ul aria-label="음식 추천 목록">
              {recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <button onClick={() => handleSelect(recommendation)} type="button">
                    {getFoodRecommendationOptionLabel(recommendation)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function getFoodRecommendationOptionLabel(recommendation: TFoodRecommendation) {
  const foodsLabel = recommendation.foods
    .map((food) => [food.name, food.amount].filter(Boolean).join(" "))
    .join(", ");

  return [recommendation.source, foodsLabel].filter(Boolean).join(" · ");
}
