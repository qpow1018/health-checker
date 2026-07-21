import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";

import type { TRecordFavoriteRow } from "@/api/recordFavorites/type";
import { getRecordCategoryLabel, getRecordDescription } from "@/utils/healthRecordsPresentation";

import Button from "@/components/common/button/Button";

import styles from "./sortableFavoriteItem.module.scss";

export default function SortableFavoriteItem(props: {
  favorite: TRecordFavoriteRow;
  isDisabled: boolean;
  onDelete: (favorite: TRecordFavoriteRow) => void;
  onEdit: (favorite: TRecordFavoriteRow) => void;
}) {
  const { favorite, isDisabled, onDelete, onEdit } = props;
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: favorite.id, disabled: isDisabled });
  const description = getRecordDescription(favorite);

  return (
    <li
      className={isDragging ? styles["is-dragging"] : undefined}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        aria-label={`${favorite.title} 순서 변경`}
        className={styles["drag-handle"]}
        disabled={isDisabled}
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator aria-hidden="true" />
      </button>

      <span className={styles["favorite-copy"]}>
        <span className={styles["category"]}>{getRecordCategoryLabel(favorite)}</span>
        <strong>{favorite.title}</strong>
        {description && <span className={styles["description"]}>{description}</span>}
      </span>

      <span className={styles["favorite-actions"]}>
        <Button
          fill="outline"
          isDisabled={isDisabled}
          onClick={() => onEdit(favorite)}
          size="small"
        >
          이름 변경
        </Button>
        <Button
          color="danger"
          fill="outline"
          isDisabled={isDisabled}
          onClick={() => onDelete(favorite)}
          size="small"
        >
          삭제
        </Button>
      </span>
    </li>
  );
}
