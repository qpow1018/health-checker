"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MdClose } from "react-icons/md";

import {
  getToastSnapshot,
  removeToast,
  subscribeToast,
  type TToastItem,
} from "@/utils/toast";

import styles from "./toastContainer.module.scss";

export default function ToastContainer() {
  const toasts = useSyncExternalStore(
    subscribeToast,
    getToastSnapshot,
    getToastSnapshot,
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles["toast-container"]}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: TToastItem }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast.duration, toast.id]);

  return (
    <div
      className={`${styles["toast"]} ${styles[`type-${toast.type}`]}`}
      role="status"
      aria-live="polite"
    >
      <p className={styles["message"]}>{toast.message}</p>

      {toast.isShowCloseButton && (
        <button
          type="button"
          className={styles["close-button"]}
          onClick={() => removeToast(toast.id)}
          aria-label="알림 닫기"
        >
          <MdClose size={16} />
        </button>
      )}
    </div>
  );
}
