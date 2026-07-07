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
  if (!isOpen) {
    return null;
  }

  const titleId = title ? "bottom-modal-title" : undefined;

  return (
    <div
      className={styles["bottom-modal-overlay"]}
      data-testid="bottom-modal-overlay"
      onClick={onClose}
    >
      <section
        className={styles["bottom-modal"]}
        role="dialog"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={titleId}
        aria-modal="true"
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
