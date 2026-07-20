import { useEffect, useState } from "react";

import { useFoodRecommendations } from "@/queries/foodRecommendationsQuery";
import toast from "@/utils/toast";

import BottomModal from "@/components/common/bottomModal/BottomModal";
import Button from "@/components/common/button/Button";
import TextInput from "@/components/common/form/TextInput";
import BoxLoading from "@/components/common/loading/BoxLoading";

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

  const {
    data: recommendations = [],
    isError,
    isLoading,
  } = useFoodRecommendations(debouncedSearch);

  const isSearchPending = search !== debouncedSearch;
  const isRecommendationListReady = !isLoading && !isSearchPending && !isError;
  const hasRecommendations = recommendations.length > 0;
  const emptyRecommendationCopy = debouncedSearch
    ? {
        title: "찾는 기록이 없어요",
        description: "가게나 음식 이름을 바꿔서 검색해 보세요.",
      }
    : {
        title: "아직 불러올 기록이 없어요",
        description: "먹은 기록이 쌓이면 여기에서 빠르게 불러올 수 있어요.",
      };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (isOpen && isError) {
      toast.error("음식 추천을 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }, [isError, isOpen]);

  function handleClose() {
    setIsOpen(false);
  }

  function handleOpen() {
    setIsOpen(true);
  }

  function handleSelect(recommendation: TFoodRecommendation) {
    onSelect(recommendation);
    setSearch("");
    setDebouncedSearch("");
    setIsOpen(false);
  }

  return (
    <div className={styles["food-recommendation-picker"]}>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        color="accent"
        fill="soft"
        isFullWidth
        onClick={handleOpen}
        size="large"
      >
        기록 찾기
      </Button>

      <BottomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="이전 기록 불러오기"
      >
        <div className={styles["recommendation-modal"]}>
          <label className={styles["sr-only"]} htmlFor={id}>
            가게 또는 음식 검색
          </label>
          <TextInput
            autoComplete="off"
            id={id}
            onChange={setSearch}
            placeholder="가게 또는 음식 검색"
            type="search"
            value={search}
          />

          {!isRecommendationListReady && <BoxLoading height="100%" />}

          {isRecommendationListReady && !hasRecommendations && (
            <div className={styles["recommendation-empty"]} role="status">
              <p className={styles["recommendation-empty-title"]}>
                {emptyRecommendationCopy.title}
              </p>
              <p className={styles["recommendation-empty-description"]}>
                {emptyRecommendationCopy.description}
              </p>
            </div>
          )}

          {isRecommendationListReady && hasRecommendations && (
            <ul
              aria-label="음식 추천 목록"
              className={styles["recommendation-list"]}
            >
              {recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <button
                    onClick={() => handleSelect(recommendation)}
                    type="button"
                  >
                    <span className={styles["recommendation-copy"]}>
                      <strong className={styles["recommendation-foods"]}>
                        {getFoodRecommendationFoodsLabel(recommendation)}
                      </strong>

                      {recommendation.source && (
                        <span className={styles["recommendation-source"]}>
                          {recommendation.source}
                        </span>
                      )}
                    </span>

                    <span
                      aria-hidden="true"
                      className={styles["recommendation-action"]}
                    >
                      선택
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </BottomModal>
    </div>
  );
}

function getFoodRecommendationFoodsLabel(recommendation: TFoodRecommendation) {
  return recommendation.foods
    .map((food) => [food.name, food.amount].filter(Boolean).join(" "))
    .join(", ");
}
