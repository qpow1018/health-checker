import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import styles from "./bottomModal.module.scss";

type TBottomModalProps = {
  title?: string;
  ariaLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export default function BottomModal({
  title,
  ariaLabel,
  isOpen,
  onClose,
  children,
}: TBottomModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const generatedTitleId = useId();
  const titleId = title ? generatedTitleId : undefined;

  onCloseRef.current = onClose;

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
        event.preventDefault();
        onCloseRef.current();
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
      className={styles["bottom-modal-overlay"]}
      data-testid="bottom-modal-overlay"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className={styles["bottom-modal"]}
        role="dialog"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={titleId}
        aria-modal="true"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["bottom-modal-indicator"]} />

        {title && (
          <header className={styles["bottom-modal-header"]}>
            <h2 className={styles["bottom-modal-title"]} id={titleId}>
              {title}
            </h2>
          </header>
        )}

        {children}
      </section>
    </div>
  );
}
