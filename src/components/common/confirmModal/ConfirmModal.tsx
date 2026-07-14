import { useEffect, useId, useRef } from "react";

import Button, { type TButtonColor } from "@/components/common/button/Button";

import styles from "./confirmModal.module.scss";

type TConfirmModalAction = {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
};

export default function ConfirmModal(props: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  cancelButton: TConfirmModalAction;
  confirmButton: TConfirmModalAction & {
    color: TButtonColor;
  };
}) {
  const {
    isOpen,
    title,
    message,
    onClose,
    cancelButton,
    confirmButton,
  } = props;
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const isLockedRef = useRef(false);
  const titleId = useId();
  const messageId = useId();

  onCloseRef.current = onClose;
  isLockedRef.current = Boolean(
    cancelButton.isDisabled ||
      cancelButton.isLoading ||
      confirmButton.isDisabled ||
      confirmButton.isLoading,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const firstEnabledButton = dialog?.querySelector<HTMLButtonElement>("button:not(:disabled)");

    (firstEnabledButton ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!isLockedRef.current) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const enabledButtons = Array.from(
        dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
      );

      event.preventDefault();

      if (enabledButtons.length === 0) {
        dialogRef.current.focus();
        return;
      }

      const currentIndex = enabledButtons.indexOf(document.activeElement as HTMLButtonElement);
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + enabledButtons.length) % enabledButtons.length
        : (currentIndex + 1) % enabledButtons.length;
      const nextButton =
        currentIndex === -1
          ? enabledButtons[event.shiftKey ? enabledButtons.length - 1 : 0]
          : enabledButtons[nextIndex];

      nextButton.focus();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles["confirm-modal-overlay"]}
      data-testid="confirm-modal-overlay"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className={styles["confirm-modal"]}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        aria-modal="true"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles["confirm-modal-header"]}>
          <h2 id={titleId}>{title}</h2>
        </header>
        <p className={styles["confirm-modal-message"]} id={messageId}>
          {message}
        </p>
        <div className={styles["confirm-modal-actions"]}>
          <Button
            color="gray"
            fill="outline"
            size="large"
            isFullWidth
            isDisabled={cancelButton.isDisabled}
            isLoading={cancelButton.isLoading}
            onClick={cancelButton.onClick}
          >
            {cancelButton.label}
          </Button>
          <Button
            color={confirmButton.color}
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
