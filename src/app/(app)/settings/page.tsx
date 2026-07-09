import styles from "./settingsPage.module.scss";

export default function SettingsPage() {
  return (
    <main className={styles["settings-page"]}>
      <section className={styles["surface"]}>
        <p className={styles["eyebrow"]}>설정</p>
        <h1>설정</h1>
        <p className={styles["muted"]}>계정과 앱 설정은 다음 단계에서 정리합니다.</p>
      </section>
    </main>
  );
}
