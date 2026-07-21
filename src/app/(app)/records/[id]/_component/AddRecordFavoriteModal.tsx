import { useState } from "react";

import { useCreateRecordFavorite } from "@/queries/recordFavoritesQuery";
import toast from "@/utils/toast";

import BottomModal from "@/components/common/bottomModal/BottomModal";
import Button from "@/components/common/button/Button";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";

import styles from "./addRecordFavoriteModal.module.scss";

type TAddRecordFavoriteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
};

export default function AddRecordFavoriteModal({
  isOpen,
  onClose,
  recordId,
}: TAddRecordFavoriteModalProps) {
  const [title, setTitle] = useState("");
  const { mutateAsync: createRecordFavorite, isPending } =
    useCreateRecordFavorite();

  function handleClose() {
    if (isPending) {
      return;
    }

    setTitle("");
    onClose();
  }

  async function handleSubmit() {
    if (!title.trim() || isPending) {
      return;
    }

    try {
      await createRecordFavorite({ recordId, title });
      setTitle("");
      onClose();
      toast.success("즐겨찾기에 추가했습니다.");
    } catch {
      toast.error("즐겨찾기를 추가하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="즐겨찾기에 추가"
    >
      <form
        className={styles["favorite-form"]}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <FormRow htmlFor="favorite-title" label="즐겨찾기 이름">
          <TextInput
            autoComplete="off"
            id="favorite-title"
            isDisabled={isPending}
            maxLength={60}
            onChange={setTitle}
            placeholder="예: 아침 커피"
            value={title}
          />
        </FormRow>
        <Button
          color="primary"
          isDisabled={!title.trim()}
          isFullWidth
          isLoading={isPending}
          size="large"
          type="submit"
        >
          추가
        </Button>
      </form>
    </BottomModal>
  );
}
