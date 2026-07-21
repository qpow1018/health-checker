import { useEffect, useState } from "react";

import type { TRecordFavoriteRow } from "@/api/recordFavorites/type";
import {
  useCreateHealthRecordFromFavorite,
  useRecordFavorites,
} from "@/queries/recordFavoritesQuery";
import { getRecordDetailItems } from "@/utils/healthRecordsPresentation";
import toast from "@/utils/toast";
import { MdChevronRight } from "react-icons/md";

import BottomModal from "@/components/common/bottomModal/BottomModal";
import Button from "@/components/common/button/Button";
import BoxLoading from "@/components/common/loading/BoxLoading";

import styles from "./recordFavoritesSection.module.scss";

export default function RecordFavoritesSection() {
  const { data: favorites = [], isError, isLoading } = useRecordFavorites();
  const { mutateAsync: createHealthRecord, isPending: isCreatingRecord } =
    useCreateHealthRecordFromFavorite();
  const [selectedFavorite, setSelectedFavorite] =
    useState<TRecordFavoriteRow | null>(null);

  useEffect(() => {
    if (isError) {
      toast.error("즐겨찾기를 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }, [isError]);

  function handleClose() {
    if (isCreatingRecord) {
      return;
    }

    setSelectedFavorite(null);
  }

  async function handleCreateRecord() {
    if (!selectedFavorite || isCreatingRecord) {
      return;
    }

    try {
      const favoriteTitle = selectedFavorite.title;
      await createHealthRecord(selectedFavorite.id);
      setSelectedFavorite(null);
      toast.success(`${favoriteTitle} 기록을 저장했습니다.`);
    } catch {
      toast.error("즐겨찾기 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  const detailItems = selectedFavorite
    ? getRecordDetailItems(selectedFavorite)
    : [];

  return (
    <section
      aria-labelledby="record-favorites-title"
      className={styles["record-favorites-section"]}
    >
      <header className={styles["favorite-section-header"]}>
        <h2 id="record-favorites-title">즐겨찾기</h2>
        <p>현재 시각으로 새 기록을 만들어요.</p>
      </header>

      {isLoading && <BoxLoading height="72px" />}

      {!isLoading && !isError && favorites.length === 0 && (
        <p className={styles["empty-message"]}>
          기록 상세에서 자주 쓰는 기록을 즐겨찾기에 추가할 수 있어요.
        </p>
      )}

      {!isLoading && !isError && favorites.length > 0 && (
        <ul className={styles["favorite-list"]}>
          {favorites.map((favorite) => (
            <li key={favorite.id}>
              <Button
                aria-expanded={selectedFavorite?.id === favorite.id}
                aria-haspopup="dialog"
                className={styles["favorite-button"]}
                color="accent"
                fill="soft"
                isFullWidth
                onClick={() => setSelectedFavorite(favorite)}
                size="large"
              >
                <strong>{favorite.title}</strong>
                <MdChevronRight aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <BottomModal
        isOpen={Boolean(selectedFavorite)}
        onClose={handleClose}
        title={selectedFavorite?.title}
      >
        {selectedFavorite && (
          <div className={styles["favorite-modal-content"]}>
            <dl className={styles["favorite-detail-list"]}>
              {detailItems.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <Button
              color="primary"
              isFullWidth
              isLoading={isCreatingRecord}
              onClick={() => void handleCreateRecord()}
              size="large"
            >
              지금 기록하기
            </Button>
          </div>
        )}
      </BottomModal>
    </section>
  );
}
