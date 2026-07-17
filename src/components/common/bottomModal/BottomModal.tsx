import { useEffect, useId, useRef } from "react";
import type { ReactNode, RefObject } from "react";

import useScrollLock from "@/hooks/useScrollLock";

import styles from "./bottomModal.module.scss";

const TABBABLE_ELEMENT_SELECTOR = [
  'a[href]:not([tabindex="-1"]):not([hidden])',
  'button:not(:disabled):not([tabindex="-1"]):not([hidden])',
  'input:not(:disabled):not([type="hidden"]):not([tabindex="-1"]):not([hidden])',
  'select:not(:disabled):not([tabindex="-1"]):not([hidden])',
  'textarea:not(:disabled):not([tabindex="-1"]):not([hidden])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([hidden])',
].join(", ");

type TBottomModalProps = {
  title?: string;
  ariaLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
};

export default function BottomModal({
  title,
  ariaLabel,
  isOpen,
  onClose,
  initialFocusRef,
  children,
}: TBottomModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const generatedTitleId = useId();
  const titleId = title ? generatedTitleId : undefined;

  useScrollLock(isOpen);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const firstTabbableElement = dialog?.querySelector<HTMLElement>(TABBABLE_ELEMENT_SELECTOR);

    (initialFocusRef?.current ?? firstTabbableElement ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const tabbableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(TABBABLE_ELEMENT_SELECTOR),
      );

      event.preventDefault();

      if (tabbableElements.length === 0) {
        dialogRef.current.focus();
        return;
      }

      const currentIndex = tabbableElements.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + tabbableElements.length) % tabbableElements.length
        : (currentIndex + 1) % tabbableElements.length;
      const nextElement =
        currentIndex === -1
          ? tabbableElements[event.shiftKey ? tabbableElements.length - 1 : 0]
          : tabbableElements[nextIndex];

      nextElement.focus();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [initialFocusRef, isOpen]);

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
