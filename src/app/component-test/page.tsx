import { Button } from "@/components/common/button/Button";

import styles from "./componentTestPage.module.scss";

export default function ComponentTestPage() {
  return (
    <main className={styles["component-test-page"]}>
      <section className={styles.surface}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Component Test</p>
          <h1>공용 컴포넌트</h1>
        </header>

        <section className={styles.section} aria-labelledby="button-section-title">
          <h2 id="button-section-title">Button</h2>

          <div className={styles["button-grid"]}>
            <Button variant="primary" appearance="solid" size="large">
              Primary Solid
            </Button>
            <Button variant="primary" appearance="outline" size="large">
              Primary Outline
            </Button>
            <Button variant="secondary" appearance="solid" size="large">
              Secondary Solid
            </Button>
            <Button variant="secondary" appearance="outline" size="large">
              Secondary Outline
            </Button>
            <Button variant="secondary" appearance="soft" size="large">
              Secondary Soft
            </Button>
            <Button variant="secondary" appearance="ghost" size="large">
              Secondary Ghost
            </Button>
            <Button variant="destructive" appearance="soft" size="large">
              Destructive Soft
            </Button>
            <Button variant="destructive" appearance="outline" size="large">
              Destructive Outline
            </Button>
          </div>

          <div className={styles["button-stack"]}>
            <Button variant="primary" size="large" isFullWidth>
              전체 너비 버튼
            </Button>
            <Button variant="primary" size="large" isFullWidth isLoading>
              저장 중
            </Button>
            <Button variant="secondary" appearance="outline" size="large" isFullWidth isDisabled>
              비활성 버튼
            </Button>
          </div>

          <div className={styles["size-row"]}>
            <Button variant="secondary" size="small">
              Small
            </Button>
            <Button variant="secondary" size="medium">
              Medium
            </Button>
            <Button variant="secondary" size="large">
              Large
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}
