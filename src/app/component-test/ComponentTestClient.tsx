"use client";

import { useState } from "react";
import { Button } from "@/components/common/button/Button";
import { TextInput } from "@/components/common/form/TextInput";
import { Textarea } from "@/components/common/form/Textarea";

import styles from "./componentTestPage.module.scss";

export function ComponentTestClient() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("저녁 이후 물을 적게 마심");

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
            <Button
              variant="secondary"
              appearance="outline"
              size="large"
              isFullWidth
              isDisabled
            >
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

        <section className={styles.section} aria-labelledby="form-section-title">
          <h2 id="form-section-title">Form</h2>

          <div className={styles["form-stack"]}>
            <TextInput
              autoComplete="email"
              helperText="허용된 계정 이메일을 입력하세요."
              id="component-test-email"
              inputMode="email"
              label="이메일"
              onChange={setEmail}
              placeholder="name@example.com"
              type="email"
              value={email}
            />

            <TextInput
              errorMessage="비밀번호를 다시 확인해주세요."
              id="component-test-password"
              label="비밀번호"
              onChange={() => undefined}
              type="password"
              value="wrong-password"
            />

            <Textarea
              helperText="상세 기록에 남길 내용을 짧게 적어주세요."
              id="component-test-note"
              label="메모"
              onChange={setNote}
              rows={4}
              value={note}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
