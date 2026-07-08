import { Button, type TButtonVariant } from "@/components/common/button/Button";

import styles from "./confirmModal.module.scss";

type TConfirmModalAction = {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
};

type TConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  cancelButton: TConfirmModalAction;
  confirmButton: TConfirmModalAction & {
    variant: TButtonVariant;
  };
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  onClose,
  cancelButton,
  confirmButton,
}: TConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const titleId = "confirm-modal-title";
  const messageId = "confirm-modal-message";

  return (
    <div
      className={styles["confirm-modal-overlay"]}
      data-testid="confirm-modal-overlay"
      onClick={onClose}
    >
      <section
        className={styles["confirm-modal"]}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
        </header>
        <p className={styles.message} id={messageId}>
          {message}
        </p>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            appearance="outline"
            size="large"
            isFullWidth
            isDisabled={cancelButton.isDisabled}
            isLoading={cancelButton.isLoading}
            onClick={cancelButton.onClick}
          >
            {cancelButton.label}
          </Button>
          <Button
            variant={confirmButton.variant}
            size="large"
            isFullWidth
            isDisabled={confirmButton.isDisabled}
            isLoading={confirmButton.isLoading}
            onClick={confirmButton.onClick}
          >
            {confirmButton.label}
          </Button>
        </div>
      </section>
    </div>
  );
}
