"use client";

import Link from "next/link";

import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";

import styles from "./recordsPageClient.module.scss";

export function RecordsPageClient() {
  return (
    <main className={styles["records-page-content"]} aria-label="기록 보기 화면">
      <div className={styles["app-canvas"]}>
        <header className={styles.topbar}>
          <p className={styles.eyebrow}>기록 보기</p>
          <h1>저장한 기록을 확인해요</h1>
        </header>

        <section className={styles["empty-state"]} aria-label="빈 기록">
          <h2>아직 저장된 기록이 없습니다.</h2>
          <p>새 기록 모델을 준비하고 있습니다.</p>
          <Link className={styles["record-link"]} href="/record">
            기록하러 가기
          </Link>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}
