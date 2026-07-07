"use client";

import { useAuthSession } from "@/components/auth/AuthGate";
import styles from "./recordPageContent.module.scss";

export function RecordPageContent() {
  const { email, signOut } = useAuthSession();

  return (
    <main className={`app-shell ${styles["record-page-content"]}`}>
      <section className="surface stack">
        <header className={styles["topbar"]}>
          <div className={styles["topbar-title"]}>
            <p className="eyebrow">오늘 기록</p>
            <h1>화장실 기록</h1>
          </div>
          <button className={styles["ghost-button"]} type="button" onClick={() => void signOut()}>
            로그아웃
          </button>
        </header>

        <p className="muted">{email}</p>

        <div className={styles["quick-actions"]} aria-label="빠른 기록">
          <button className={`${styles["record-button"]} ${styles["urine"]}`} type="button" disabled>
            소변
          </button>
          <button className={`${styles["record-button"]} ${styles["bowel"]}`} type="button" disabled>
            대변
          </button>
          <button className={`${styles["record-button"]} ${styles["combined"]}`} type="button" disabled>
            둘 다
          </button>
        </div>

        <p className={styles["notice"]}>다음 단계에서 원탭 저장을 연결합니다.</p>
      </section>
    </main>
  );
}
