import styles from "./reportPage.module.scss";

export default function ReportPage() {
  return (
    <main className={styles["report-page"]}>
      <section className={styles["surface"]}>
        <p className={styles["eyebrow"]}>AI 리포트</p>
        <h1>AI 리포트</h1>
        <p className={styles["muted"]}>기록이 충분히 쌓인 뒤 패턴 요약을 연결합니다.</p>
      </section>
    </main>
  );
}
