"use client";

import { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { TRecordFavoriteRow } from "@/api/recordFavorites/type";
import {
  useDeleteRecordFavorite,
  useRecordFavorites,
  useReorderRecordFavorites,
  useUpdateRecordFavoriteTitle,
} from "@/queries/recordFavoritesQuery";
import toast from "@/utils/toast";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomModal from "@/components/common/bottomModal/BottomModal";
import Button from "@/components/common/button/Button";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";
import BoxLoading from "@/components/common/loading/BoxLoading";

import SortableFavoriteItem from "./_component/SortableFavoriteItem";

import styles from "./favoritesPageClient.module.scss";

export default function FavoritesPageClient() {
  const { data: favorites = [], isError, isLoading } = useRecordFavorites();
  const { mutateAsync: updateTitle, isPending: isUpdating } =
    useUpdateRecordFavoriteTitle();
  const { mutateAsync: deleteFavorite, isPending: isDeleting } =
    useDeleteRecordFavorite();
  const { mutateAsync: reorderFavorites, isPending: isReordering } =
    useReorderRecordFavorites();
  const [orderedFavorites, setOrderedFavorites] = useState(favorites);
  const [editingFavorite, setEditingFavorite] =
    useState<TRecordFavoriteRow | null>(null);
  const [deletingFavorite, setDeletingFavorite] =
    useState<TRecordFavoriteRow | null>(null);
  const [favoriteTitle, setFavoriteTitle] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const isMutating = isUpdating || isDeleting || isReordering;

  useEffect(() => {
    setOrderedFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    if (isError) {
      toast.error("즐겨찾기를 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }, [isError]);

  function handleOpenEdit(favorite: TRecordFavoriteRow) {
    setEditingFavorite(favorite);
    setFavoriteTitle(favorite.title);
  }

  function handleCloseEdit() {
    if (isUpdating) {
      return;
    }

    setEditingFavorite(null);
    setFavoriteTitle("");
  }

  async function handleUpdateTitle() {
    if (!editingFavorite || !favoriteTitle.trim() || isUpdating) {
      return;
    }

    try {
      await updateTitle({ id: editingFavorite.id, title: favoriteTitle });
      setEditingFavorite(null);
      setFavoriteTitle("");
      toast.success("즐겨찾기 이름을 변경했습니다.");
    } catch {
      toast.error("즐겨찾기 이름을 변경하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  function handleCloseDelete() {
    if (isDeleting) {
      return;
    }

    setDeletingFavorite(null);
  }

  async function handleDelete() {
    if (!deletingFavorite || isDeleting) {
      return;
    }

    try {
      await deleteFavorite(deletingFavorite.id);
      setDeletingFavorite(null);
      toast.success("즐겨찾기를 삭제했습니다.");
    } catch {
      toast.error("즐겨찾기를 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || isReordering) {
      return;
    }

    const previousFavorites = orderedFavorites;
    const previousIndex = previousFavorites.findIndex(
      (favorite) => favorite.id === active.id,
    );
    const nextIndex = previousFavorites.findIndex(
      (favorite) => favorite.id === over.id,
    );

    if (previousIndex < 0 || nextIndex < 0) {
      return;
    }

    const nextFavorites = arrayMove(previousFavorites, previousIndex, nextIndex);
    setOrderedFavorites(nextFavorites);

    try {
      await reorderFavorites(nextFavorites.map((favorite) => favorite.id));
    } catch {
      setOrderedFavorites(previousFavorites);
      toast.error("즐겨찾기 순서를 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  const isListReady = !isLoading && !isError;

  return (
    <main className={styles["favorites-page"]} aria-label="즐겨찾기 관리 화면">
      <AppHeader title="즐겨찾기 관리" />

      <div className={styles["favorites-content"]}>
        <p className={styles["description"]}>
          드래그해서 메인 화면에 표시되는 순서를 바꿀 수 있어요.
        </p>

        {!isListReady && <BoxLoading />}

        {isListReady && orderedFavorites.length === 0 && (
          <p className={styles["notice-message"]}>등록된 즐겨찾기가 없습니다.</p>
        )}

        {isListReady && orderedFavorites.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(event) => void handleDragEnd(event)}
            sensors={sensors}
          >
            <SortableContext
              items={orderedFavorites.map((favorite) => favorite.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className={styles["favorite-list"]}>
                {orderedFavorites.map((favorite) => (
                  <SortableFavoriteItem
                    favorite={favorite}
                    isDisabled={isMutating}
                    key={favorite.id}
                    onDelete={setDeletingFavorite}
                    onEdit={handleOpenEdit}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <BottomModal
        isOpen={Boolean(editingFavorite)}
        onClose={handleCloseEdit}
        title="즐겨찾기 이름 변경"
      >
        <form
          className={styles["edit-form"]}
          onSubmit={(event) => {
            event.preventDefault();
            void handleUpdateTitle();
          }}
        >
          <FormRow htmlFor="favorite-title" label="즐겨찾기 이름">
            <TextInput
              autoComplete="off"
              id="favorite-title"
              isDisabled={isUpdating}
              maxLength={60}
              onChange={setFavoriteTitle}
              value={favoriteTitle}
            />
          </FormRow>
          <Button
            color="primary"
            isDisabled={!favoriteTitle.trim()}
            isFullWidth
            isLoading={isUpdating}
            size="large"
            type="submit"
          >
            변경
          </Button>
        </form>
      </BottomModal>

      <ConfirmModal
        cancelButton={{
          isDisabled: isDeleting,
          label: "취소",
          onClick: handleCloseDelete,
        }}
        confirmButton={{
          color: "danger",
          isDisabled: isDeleting,
          isLoading: isDeleting,
          label: "삭제",
          onClick: () => void handleDelete(),
        }}
        isOpen={Boolean(deletingFavorite)}
        message="기존 건강 기록은 유지됩니다."
        onClose={handleCloseDelete}
        title="이 즐겨찾기를 삭제할까요?"
      />
    </main>
  );
}
