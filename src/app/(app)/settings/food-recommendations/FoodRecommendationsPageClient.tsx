"use client";

import { useState } from "react";

import {
  useAllFoodRecommendations,
  useDeleteFoodRecommendation,
} from "@/queries/foodRecommendationsQuery";
import { getFoodRecommendationLabel } from "@/utils/foodRecommendations";

import AppHeader from "@/components/common/appHeader/AppHeader";
import Button from "@/components/common/button/Button";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";
import BoxLoading from "@/components/common/loading/BoxLoading";

import type { TFoodRecommendation } from "@/api/foodRecommendations/type";

import styles from "./foodRecommendationsPageClient.module.scss";

export default function FoodRecommendationsPageClient() {
  const { data: recommendations = [], isError, isLoading } = useAllFoodRecommendations();
  const { mutateAsync: deleteRecommendation, isPending: isDeleting } =
    useDeleteFoodRecommendation();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<TFoodRecommendation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function handleCloseDeleteConfirm() {
    if (isDeleting) {
      return;
    }

    setSelectedRecommendation(null);
  }

  async function handleDeleteRecommendation() {
    if (!selectedRecommendation || isDeleting) {
      return;
    }

    setErrorMessage("");

    try {
      await deleteRecommendation(selectedRecommendation.id);
      setSelectedRecommendation(null);
    } catch {
      setErrorMessage("음식 추천을 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <main
      className={styles["food-recommendations-page"]}
      aria-label="음식 추천 목록 설정 화면"
    >
      <AppHeader title="음식 추천 목록" />

      <div className={styles["food-recommendations-content"]}>
        <p className={styles["description"]}>
          먹은 것 기록에서 저장된 추천입니다. 추천을 삭제해도 기존 기록은 유지됩니다.
        </p>

        {isLoading ? (
          <BoxLoading />
        ) : isError ? (
          <p className={styles["notice-message"]} role="status">
            음식 추천을 불러오지 못했습니다.
          </p>
        ) : recommendations.length === 0 ? (
          <p className={styles["notice-message"]}>저장된 음식 추천이 없습니다.</p>
        ) : (
          <ul className={styles["recommendation-list"]}>
            {recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <span>{getFoodRecommendationLabel(recommendation)}</span>
                <Button
                  color="danger"
                  fill="outline"
                  onClick={() => setSelectedRecommendation(recommendation)}
                  size="small"
                  type="button"
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        )}

        {errorMessage ? (
          <p className={styles["error-message"]} role="status">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <ConfirmModal
        isOpen={Boolean(selectedRecommendation)}
        title="음식 추천 삭제"
        message="이 추천을 삭제할까요? 기존 먹은 것 기록은 유지됩니다."
        onClose={handleCloseDeleteConfirm}
        cancelButton={{
          label: "취소",
          onClick: handleCloseDeleteConfirm,
          isDisabled: isDeleting,
        }}
        confirmButton={{
          label: "삭제",
          color: "danger",
          onClick: () => void handleDeleteRecommendation(),
          isDisabled: isDeleting,
          isLoading: isDeleting,
        }}
      />
    </main>
  );
}
